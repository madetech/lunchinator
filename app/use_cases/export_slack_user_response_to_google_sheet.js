const config = require("@app/config");
const moment = require("moment");

class ExportSlackUserResponseToGoogleSheet {
  constructor({ googleSheetGateway }) {
    this.googleSheetGateway = googleSheetGateway;
  }

  async execute({ lunchCycle, slackUserResponses }) {
    const doc = await this.googleSheetGateway.fetchDoc(config.LUNCH_CYCLE_RESPONSES_SHEET_ID);

    this.restaurantsHash = this._buildRestaurantsHash({ lunchCycle });
    this.allHeaderKeys = this._buildAllHeaderKeys();

    const lunchCycleWorksheet = await this.findOrCreateLunchCycleWorksheet({
      lunchCycle,
      doc
    });

    await this.fillInWorksheet({ slackUserResponses, lunchCycleWorksheet });

    return true;
  }

  async findOrCreateLunchCycleWorksheet({ lunchCycle, doc }) {
    const lunchCycleSheetTitle = moment.utc(lunchCycle.starts_at).format("DD/MM/YYYY");

    const sheetInfo = await this.googleSheetGateway.getInfo(doc);
    const foundWorksheet = sheetInfo.worksheets.find(ws => ws.title === lunchCycleSheetTitle);

    if (foundWorksheet) {
      return foundWorksheet;
    }

    const restaurantsHeader = Object.keys(this.restaurantsHash).map(key => {
      return this.restaurantsHash[key].humanHeader;
    });

    const worksheet = await this.googleSheetGateway.addWorksheetTo({
      doc: doc,
      title: lunchCycleSheetTitle,
      headers: ["First Name", "Email"].concat(restaurantsHeader)
    });

    return worksheet;
  }

  async fillInWorksheet({ slackUserResponses, lunchCycleWorksheet }) {
    const rows = await this.googleSheetGateway.getRows(lunchCycleWorksheet);

    for (const slackUserResponse of slackUserResponses) {
      const existingRow = rows.find(r => r.email === slackUserResponse.email);
      const rowObject = this._buildRowObject({ slackUserResponse });

      if (existingRow) {
        // Cannot do `{ ...existingRow, ...rowObject }` as the `#save()` function doesn't work.
        Object.keys(rowObject).forEach(key => {
          existingRow[key] = rowObject[key];
        });
        await this.googleSheetGateway.saveRow({ row: existingRow });
      } else {
        await this.googleSheetGateway.addRow({
          sheet: lunchCycleWorksheet,
          row: rowObject
        });
      }
    }
  }

  _buildRowObject({ slackUserResponse }) {
    const rowObject = {
      firstname: slackUserResponse.firstName,
      email: slackUserResponse.email
    };

    // Blank out all restaurants
    this.allHeaderKeys.forEach(key => {
      rowObject[key] = "";
    });

    // Set availablity
    slackUserResponse.availableEmojis.forEach(e => {
      const foundRestaurant = this.restaurantsHash[e];
      rowObject[foundRestaurant.headerKey] = "x";
    });

    return rowObject;
  }

  _buildRestaurantsHash({ lunchCycle }) {
    const restaurantsHash = lunchCycle.restaurants.reduce((hash, r, i) => {
      const escapedName = r.name.replace(/[\W_]+/g, "");
      const nextDate = moment.utc(lunchCycle.starts_at).add(i * 7, "days");
      const header = `${escapedName} - ${nextDate.format("DD/MM/YYYY")}`;
      const headerKey = header.replace(/[()/\s']/g, "").toLowerCase();

      hash[r.emoji] = {
        emoji: r.emoji,
        humanHeader: header,
        headerKey: headerKey
      };

      return hash;
    }, {});

    return restaurantsHash;
  }

  _buildAllHeaderKeys() {
    const allHeaderKeys = [];

    Object.keys(this.restaurantsHash).forEach(key => {
      allHeaderKeys.push(this.restaurantsHash[key].headerKey);
    });

    return allHeaderKeys;
  }
}

module.exports = ExportSlackUserResponseToGoogleSheet;