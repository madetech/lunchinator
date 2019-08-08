const config = require("@app/config");

class FetchNonRespondersFromGoogleSheets {
  constructor(options) {
    this.googleSheetGateway = options.googleSheetGateway;
  }

  async execute() {
    const rows = await this.googleSheetGateway.fetchRows(config.AVA_LIST_SHEET_ID);

    return rows;
  }
}

module.exports = FetchNonRespondersFromGoogleSheets;
