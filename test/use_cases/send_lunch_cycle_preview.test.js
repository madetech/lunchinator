const { expect, sinon } = require("../test_helper");
const { SendLunchCyclePreview } = require("@use_cases");

describe("SendLunchCyclePreview", function() {
  it("send lunch cycle preview", function() {
    const gatewaySpy = { sendMessage: sinon.fake.returns(true) };
    const useCase = new SendLunchCyclePreview({ gateway: gatewaySpy });

    const response = useCase.execute({ message: "x" });

    expect(gatewaySpy.sendMessage).to.have.been.calledWith("x");
    expect(response.isSent).to.equal(true);
  });
});
