const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const CreateNewCycle = require("../../app/use_cases/create_new_cycle");
const expect = chai.expect;
chai.use(sinonChai);

describe("CreateNewCycle", function() {
  it("create a new cycle", function() {
    const gatewaySpy = { save: sinon.spy() };
    const useCase = new CreateNewCycle({ gateway: gatewaySpy });

    useCase.execute();

    expect(gatewaySpy.save).to.have.been.called;
  });
});
