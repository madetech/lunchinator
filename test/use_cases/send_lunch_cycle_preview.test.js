const { expect, sinon } = require("../test_helper");
const { SendLunchCyclePreview } = require("@use_cases");

describe("SendLunchCyclePreview", function() {
  it("send lunch cycle preview", function() {
    const gatewaySpy = { sendMessageWithBlocks: sinon.fake.returns(true) };
    const useCase = new SendLunchCyclePreview({ gateway: gatewaySpy });

    const response = useCase.execute({ message: "x" });

    expect(gatewaySpy.sendMessageWithBlocks).to.have.been.calledWith("x");
    expect(response.isSent).to.equal(true);
  });
});
