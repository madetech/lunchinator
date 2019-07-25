const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");
const config = require("@app/config");

class GoogleSheetGateway {
  async fetchRows(sheetId) {
    const doc = this.newGoogleSpreadsheet(sheetId);
    const sheet = await this.getFirstSheet(doc);
    const rows = await this.getRows(sheet);

    return rows;
  }

  newGoogleSpreadsheet(sheetId) {
    return new GoogleSpreadsheet(sheetId);
  }

  async getFirstSheet(doc) {}

  async getRows(sheet) {}
}

module.exports = GoogleSheetGateway;
