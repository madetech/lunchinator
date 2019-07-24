const { expect, sinon } = require("../test_helper");
const GetPreviousLunchCycle = require("@use_cases/get_previous_lunch_cycle");

describe("GetPreviousLunchCycle", function() {
  it("returns the previous lunch cycle", function() {
    const lunchCycleDummy = {};
    const otherLunchCycleDummy = {};
    const lunchCycleGatewaySpy = { findPrevious: sinon.fake.returns(otherLunchCycleDummy) };

    const useCase = new GetPreviousLunchCycle({ lunchCycleGateway: lunchCycleGatewaySpy });
    const response = useCase.execute(lunchCycleDummy);

    expect(lunchCycleGatewaySpy.findPrevious).to.have.been.calledWith(lunchCycleDummy);
    expect(response.previousLunchCycle).to.equal(otherLunchCycleDummy);
  });
});
