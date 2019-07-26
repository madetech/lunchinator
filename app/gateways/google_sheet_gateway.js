const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");
const config = require("@app/config");

class GoogleSheetGatewayError extends Error {
  constructor(message) {
    super(message);
    this.name = "GoogleSheetGatewayError";
  }
}

class GoogleSheetGateway {
  async fetchRows(sheetId) {
    try {
      const doc = this.newGoogleSpreadsheet(sheetId);
      const sheet = await this.getFirstSheet(doc);
      const rows = await this.getRows(sheet);

      return rows;
    } catch (err) {
      throw new GoogleSheetGatewayError(err.message);
    }
  }

  newGoogleSpreadsheet(sheetId) {
    return new GoogleSpreadsheet(sheetId);
  }

  async getFirstSheet(doc) {
    const creds = {
      client_email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    };

    // We need to wait for the Auth Service to finish before we can proceed
    const authResult = await promisify(doc.useServiceAccountAuth)(creds).catch(() => null);

    if (authResult === null) {
      throw new Error("Auth Error");
    }

    const info = await promisify(doc.getInfo)().catch(() => null);

    if (info === null) {
      throw new Error("Cannot getInfo for doc");
    }

    return info.worksheets[0];
  }

  async getRows(sheet) {
    return await promisify(sheet.getRows)();
  }
}

module.exports = {
  GoogleSheetGateway,
  GoogleSheetGatewayError
};
