require("module-alias/register");

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const LunchCycle = require("@domain/lunch_cycle");
const CreateNewLunchCycle = require("@use_cases/create_new_lunch_cycle");
const expect = chai.expect;
chai.use(sinonChai);

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
