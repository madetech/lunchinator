const { expect, sinon, config } = require("../test_helper");
const { GoogleSheetGateway, GoogleSheetGatewayError } = require("@gateways");

describe("GoogleSheetGateway", function() {
  it("can fetch a sheet", async function() {
    const sheetIdDummy = "abc123";
    const gateway = new GoogleSheetGateway();
    const dummyDoc = {};

    sinon.stub(gateway, "newGoogleSpreadsheet").returns(dummyDoc);
    sinon.stub(gateway, "doAuth");

    const returnedDoc = await gateway.fetchSheet(sheetIdDummy);

    expect(gateway.newGoogleSpreadsheet).to.have.been.calledWith(sheetIdDummy);

    expect(returnedDoc).to.eql(dummyDoc);
  });

  it("can fetch rows from a sheet", async function() {
    const sheetIdDummy = "abc123";
    const gateway = new GoogleSheetGateway();
    const dummyDoc = {};
    const dummySheet = {};
    const dummyRows = [];

    sinon.stub(gateway, "newGoogleSpreadsheet").returns(dummyDoc);
    sinon.stub(gateway, "doAuth");
    sinon.stub(gateway, "getFirstSheet").resolves(dummySheet);
    sinon.stub(gateway, "getRows").resolves(dummyRows);

    const returnedRows = await gateway.fetchRows(sheetIdDummy);

    expect(gateway.newGoogleSpreadsheet).to.have.been.calledWith(sheetIdDummy);
    expect(gateway.getFirstSheet).to.have.been.calledWith(dummyDoc);
    expect(gateway.getRows).to.have.been.calledWith(dummySheet);

    expect(returnedRows).to.eql(dummyRows);
  });

  it("can use the correct creds", async function() {
    const dummyCreds = {
      client_email: "dummy@madetech.com",
      private_key: "Valid Key"
    };
    const fakeDoc = {
      useServiceAccountAuth: sinon.fake(),
      getInfo: sinon.fake.returns({ worksheets: [] })
    };
    const dummyId = "123";
    const gateway = new GoogleSheetGateway();

    sinon.stub(gateway, "newGoogleSpreadsheet").returns(fakeDoc);
    sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_EMAIL").get(() => dummyCreds.client_email);
    sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").get(() => dummyCreds.private_key);

    gateway.fetchRows(dummyId);

    expect(fakeDoc.useServiceAccountAuth).to.have.been.calledWith(dummyCreds);
  });

  it("can use handle auth errors", async function() {
    const dummyCreds = {
      client_email: "dummy@madetech.com",
      private_key: "Not Valid Key"
    };
    const fakeDoc = {
      useServiceAccountAuth: sinon.fake.throws(new Error("Auth Error"))
    };
    const dummyId = "123";
    const gateway = new GoogleSheetGateway();

    sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_EMAIL").get(() => dummyCreds.client_email);
    sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").get(() => dummyCreds.private_key);
    sinon.stub(gateway, "newGoogleSpreadsheet").returns(fakeDoc);

    await expect(gateway.fetchRows(dummyId)).to.be.rejectedWith(
      GoogleSheetGatewayError,
      "Google Sheets authorisation error."
    );
  });

  it("can handle errors from doc.getInfo API", async function() {
    const dummyId = "123";
    const gateway = new GoogleSheetGateway();

    const fakeDoc = {
      getInfo: sinon.fake.throws(new Error("Can't getInfo"))
    };

    sinon.stub(gateway, "newGoogleSpreadsheet").returns(fakeDoc);
    sinon.stub(gateway, "doAuth");

    await expect(gateway.fetchRows(dummyId)).to.be.rejectedWith(
      GoogleSheetGatewayError,
      "Cannot get info for Google Sheets document."
    );
  });

  it("can handle errors from sheet.getRows API", async function() {
    const dummyId = "123";
    const gateway = new GoogleSheetGateway();

    const fakeSheet = {
      getRows: sinon.fake.throws(new Error("Can't getRows"))
    };

    sinon.stub(gateway, "newGoogleSpreadsheet").returns({});
    sinon.stub(gateway, "getFirstSheet").returns(fakeSheet);
    sinon.stub(gateway, "doAuth");

    await expect(gateway.fetchRows(dummyId)).to.be.rejectedWith(
      GoogleSheetGatewayError,
      "Cannot get rows for Google Sheets sheet."
    );
  });

  it("can handle errors from sheet.addWorksheetTo API", async function() {
    const gateway = new GoogleSheetGateway();

    const fakeSheet = {
      addWorksheet: sinon.fake.throws(new Error("Can't addWorksheet"))
    };

    await expect(
      gateway.addWorksheetTo({ sheet: fakeSheet, title: "test", headers: [] })
    ).to.be.rejectedWith(GoogleSheetGatewayError, "Cannot add worksheet to Google Sheets sheet");
  });

  it("can handle errors from sheet.addRow API", async function() {
    const gateway = new GoogleSheetGateway();

    const fakeSheet = {
      addRow: sinon.fake.throws(new Error("Can't addRow"))
    };

    await expect(gateway.addRow({ sheet: fakeSheet, row: {} })).to.be.rejectedWith(
      GoogleSheetGatewayError,
      "Cannot add new row to Google Sheets sheet"
    );
  });

  it("can handle errors from row.save API", async function() {
    const gateway = new GoogleSheetGateway();

    const fakeRow = {
      save: sinon.fake.throws(new Error("Can't save row"))
    };

    await expect(gateway.saveRow({ row: fakeRow })).to.be.rejectedWith(
      GoogleSheetGatewayError,
      "Cannot save row to Google Sheets sheet"
    );
  });
});
