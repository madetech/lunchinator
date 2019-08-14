const config = require("@app/config");
const moment = require("moment");

class ExportLunchersToGoogleSheet {
  constructor({ googleSheetGateway, slackUserResponseGateway, lunchCycleGateway }) {
    this.googleSheetGateway = googleSheetGateway;
    this.slackUserResponseGateway = slackUserResponseGateway;
    this.lunchCycleGateway = lunchCycleGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    const lunchers = await this.slackUserResponseGateway.findAllForLunchCycle({ lunchCycle });
    const doc = await this.googleSheetGateway.fetchDoc(config.LUNCH_CYCLE_RESPONSES_SHEET_ID);

    this.restaurantsHash = this._buildRestaurantsHash({ lunchCycle });
    this.allHeaderKeys = this._buildAllHeaderKeys();

    const worksheet = await this.findOrCreateLunchCycleWorksheet({
      lunchCycle,
      doc
    });

    await this.fillInWorksheet({ lunchers, worksheet });

    return true;
  }

  async findOrCreateLunchCycleWorksheet({ lunchCycle, doc }) {
    const workSheetTitle = moment.utc(lunchCycle.starts_at).format("DD/MM/YYYY");
    const docInfo = await this.googleSheetGateway.getInfo(doc);
    const foundWorksheet = docInfo.worksheets.find(ws => ws.title === workSheetTitle);

    if (foundWorksheet) {
      return foundWorksheet;
    }

    const restaurantsHeader = Object.keys(this.restaurantsHash).map(key => {
      return this.restaurantsHash[key].humanHeader;
    });

    const worksheet = await this.googleSheetGateway.addWorksheetTo({
      doc: doc,
      title: workSheetTitle,
      headers: ["First Name", "Email"].concat(restaurantsHeader)
    });

    return worksheet;
  }

  async fillInWorksheet({ lunchers, worksheet }) {
    const rows = await this.googleSheetGateway.getRows(worksheet);

    for (const luncher of lunchers) {
      const existingRow = rows.find(r => r.email === luncher.email);
      const rowObject = this._buildRowObject({ luncher });

      if (existingRow) {
        // Cannot do `{ ...existingRow, ...rowObject }` as the `#save()` function doesn't work.
        Object.keys(rowObject).forEach(key => {
          existingRow[key] = rowObject[key];
        });
        await this.googleSheetGateway.saveRow({ row: existingRow });
      } else {
        await this.googleSheetGateway.addRow({
          sheet: worksheet,
          row: rowObject
        });
      }
    }
  }

  _buildRowObject({ luncher }) {
    const rowObject = {
      firstname: luncher.firstName,
      email: luncher.email
    };

    // Blank out all restaurants
    this.allHeaderKeys.forEach(key => {
      rowObject[key] = "";
    });

    // Set availablity
    luncher.availableEmojis.forEach(e => {
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

module.exports = ExportLunchersToGoogleSheet;
