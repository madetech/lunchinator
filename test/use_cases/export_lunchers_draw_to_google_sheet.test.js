const { expect, sinon, config } = require("../test_helper");
const { LunchCycle, LunchCycleWeek } = require("@domain");
const { ExportLunchersDrawToGoogleSheet } = require("@use_cases");
const { RestaurantFactory } = require("../factories");

describe("ExportLunchersDrawToGoogleSheet", function() {
  it("uses the correct Google Sheet ID", async function() {
    const lunchCyclesWeeksStub = {
      LunchCycleWeeks: [
        new LunchCycleWeek({
          restaurant: "",
          lunchers: [],
          allAvailable: []
        })
      ]
    };
    const fakeSheetGateway = {
      fetchDoc: sinon.stub().resolves({}),
      addWorksheetTo: sinon.stub().resolves({}),
      addRow: sinon.stub().resolves({})
    };
    const useCase = new ExportLunchersDrawToGoogleSheet({
      googleSheetGateway: fakeSheetGateway
    });

    const dummySheetId = "dummy";

    sinon.stub(config, "LUNCH_CYCLE_WEEK_SHEET_ID").get(() => dummySheetId);

    await useCase.execute({ lunchCycleWeeks: lunchCyclesWeeksStub.LunchCycleWeeks });

    expect(fakeSheetGateway.fetchDoc).to.have.been.calledOnceWith(dummySheetId);
  });
});
