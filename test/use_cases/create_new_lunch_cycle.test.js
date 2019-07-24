const { expect, sinon } = require("../test_helper");
const LunchCycle = require("@domain/lunch_cycle");
const CreateNewLunchCycle = require("@use_cases/create_new_lunch_cycle");

describe("CreateNewLunchCycle", function() {
  it("create a new lunch cycle", function() {
    const lunchCycleDummy = {};
    const gatewaySpy = { create: sinon.fake.returns(lunchCycleDummy) };
    const useCase = new CreateNewLunchCycle({ gateway: gatewaySpy });

    const response = useCase.execute();

    expect(gatewaySpy.create).to.have.been.calledWith(sinon.match.instanceOf(LunchCycle));
    expect(response.lunchCycle).to.equal(lunchCycleDummy);
  });
});
