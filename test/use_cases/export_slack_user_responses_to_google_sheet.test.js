const { expect, sinon, config } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { ExportSlackUserResponseToGoogleSheet } = require("@use_cases");

describe("ExportSlackUserResponseToGoogleSheet", function() {
  it("uses the correct Google Sheet ID", async function() {
    const lunchCycle = new LunchCycle({ id: 123 });
    const fakeSheetGateway = { fetchSheet: sinon.stub().resolves({}) };
    const useCase = new ExportSlackUserResponseToGoogleSheet({
      googleSheetGateway: fakeSheetGateway
    });

    const dummySheetId = "dummy";

    sinon.stub(config, "LUNCH_CYCLE_RESPONSES_SHEET_ID").get(() => dummySheetId);
    sinon.stub(useCase, "findOrCreateLunchCycleWorksheet");
    sinon.stub(useCase, "fillInWorksheet");

    await useCase.execute({ lunchCycle, slackUserResponses: [] });

    expect(fakeSheetGateway.fetchSheet).to.have.been.calledOnceWith(dummySheetId);
  });
});
