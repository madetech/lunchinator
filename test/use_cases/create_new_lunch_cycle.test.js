const { expect, sinon } = require("../test_helper");
const LunchCycle = require("@domain/lunch_cycle");
const CreateNewLunchCycle = require("@use_cases/create_new_lunch_cycle");

describe("CreateNewLunchCycle", function() {
  it("create a new lunch cycle", function() {
    const gatewaySpy = { create: sinon.spy() };
    const useCase = new CreateNewLunchCycle({ gateway: gatewaySpy });

    useCase.execute();

    expect(gatewaySpy.create).to.have.been.calledWith(
      sinon.match.instanceOf(LunchCycle)
    );
  });
});
