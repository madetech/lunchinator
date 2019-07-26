const { expect, sinon, config } = require("../test_helper");
const { GoogleSheetGateway, GoogleSheetGatewayError } = require("@gateways");

describe("GoogleSheetGateway", function() {
  it("can fetch rows from a sheet", async function() {
    const sheetIdDummy = "abc123";
    const gateway = new GoogleSheetGateway();
    const dummyDoc = {};
    const dummySheet = {};
    const dummyRows = [];

    sinon.stub(gateway, "newGoogleSpreadsheet").returns(dummyDoc);
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
      useServiceAccountAuth: sinon.fake.throws(new Error("Auth Error")),
      getInfo: sinon.fake.returns({ worksheets: [] })
    };
    const dummyId = "123";
    const gateway = new GoogleSheetGateway();

    sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_EMAIL").get(() => dummyCreds.client_email);
    sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").get(() => dummyCreds.private_key);
    sinon.stub(gateway, "newGoogleSpreadsheet").returns(fakeDoc);

    await expect(gateway.fetchRows(dummyId)).to.be.rejectedWith(GoogleSheetGatewayError);
  });

  it("can handle errors from doc.getInfo API", async function() {
    const dummyId = "123";
    const gateway = new GoogleSheetGateway();

    const fakeDoc = {
      useServiceAccountAuth: callback => callback(),
      getInfo: sinon.fake.throws(new Error("Can't getInfo"))
    };

    sinon.stub(gateway, "newGoogleSpreadsheet").returns(fakeDoc);

    await expect(gateway.fetchRows(dummyId)).to.be.rejectedWith(GoogleSheetGatewayError);
  });

  xit("can handle errors from sheet.getRows API");
});
