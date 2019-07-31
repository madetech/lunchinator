const { expect, sinon } = require("../test_helper");
const { GetPreviousLunchCycle } = require("@use_cases");

describe("GetPreviousLunchCycle", async function() {
  it("returns the previous lunch cycle", async function() {
    const otherLunchCycleDummy = {};
    const lunchCycleGatewaySpy = { findPrevious: sinon.fake.returns(otherLunchCycleDummy) };

    const useCase = new GetPreviousLunchCycle({ lunchCycleGateway: lunchCycleGatewaySpy });
    const response = await useCase.execute();

    expect(lunchCycleGatewaySpy.findPrevious).to.have.been.called;
    expect(response.previousLunchCycle).to.equal(otherLunchCycleDummy);
  });
});
