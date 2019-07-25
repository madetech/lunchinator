const { expect, sinon } = require("../test_helper");
const { GoogleSheetGateway } = require("@gateways");

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
});
