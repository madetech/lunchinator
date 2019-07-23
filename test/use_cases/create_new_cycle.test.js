require("module-alias/register");

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const LunchCycle = require("@app/domain/lunch_cycle");
const CreateNewCycle = require("@app/use_cases/create_new_cycle");
const expect = chai.expect;
chai.use(sinonChai);

describe("CreateNewCycle", function() {
  it("create a new cycle", function() {
    const gatewaySpy = { create: sinon.spy() };
    const useCase = new CreateNewCycle({ gateway: gatewaySpy });

    useCase.execute();

    expect(gatewaySpy.create).to.have.been.calledWith(
      sinon.match.instanceOf(LunchCycle)
    );
  });
});
