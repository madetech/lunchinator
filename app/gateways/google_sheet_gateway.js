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
  async fetchDoc(sheetId) {
    const doc = this.newGoogleSpreadsheet(sheetId);
    await this.doAuth(doc);

    return doc;
  }

  async fetchRows(sheetId) {
    try {
      const doc = await this.fetchDoc(sheetId);
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

  async doAuth(doc) {
    const creds = {
      client_email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    };

    // We need to wait for the Auth Service to finish before we can proceed
    const authResult = await promisify(doc.useServiceAccountAuth)(creds).catch(() => null);

    if (authResult === null) {
      throw new Error("Google Sheets authorisation error.");
    }
  }

  async getInfo(doc) {
    const info = await promisify(doc.getInfo)().catch(err => {
      console.log(err);
      return null;
    });

    if (info === null) {
      throw new GoogleSheetGatewayError("Cannot get info for Google Sheets document.");
    }

    return info;
  }

  async getFirstSheet(doc) {
    const info = await this.getInfo(doc);

    return info.worksheets[0];
  }

  async getRows(sheet) {
    const rows = await promisify(sheet.getRows)().catch(() => null);

    if (rows === null) {
      throw new GoogleSheetGatewayError("Cannot get rows for Google Sheets sheet.");
    }

    return rows;
  }
}

module.exports = {
  GoogleSheetGateway,
  GoogleSheetGatewayError
};
