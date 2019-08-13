const { expect, sinon, config } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { ExportLunchersToGoogleSheet } = require("@use_cases");

describe("ExportLunchersToGoogleSheet", function() {
  it("uses the correct Google Sheet ID", async function() {
    const lunchCycle = new LunchCycle({ id: 123 });
    const fakeSheetGateway = { fetchDoc: sinon.stub().resolves({}) };
    const useCase = new ExportLunchersToGoogleSheet({
      googleSheetGateway: fakeSheetGateway,
      slackUserResponseGateway: { findAllForLunchCycle: sinon.stub().resolves([]) },
      lunchCycleGateway: { getCurrent: sinon.stub().resolves(lunchCycle) }
    });

    const dummySheetId = "dummy";

    sinon.stub(config, "LUNCH_CYCLE_RESPONSES_SHEET_ID").get(() => dummySheetId);
    sinon.stub(useCase, "findOrCreateLunchCycleWorksheet");
    sinon.stub(useCase, "fillInWorksheet");

    await useCase.execute();

    expect(fakeSheetGateway.fetchDoc).to.have.been.calledOnceWith(dummySheetId);
  });
});
