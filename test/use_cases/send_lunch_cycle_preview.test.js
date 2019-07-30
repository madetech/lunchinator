const { expect, sinon } = require("../test_helper");
const { SendLunchCyclePreview } = require("@use_cases");
const { SlackMessage } = require("@domain");

describe("SendLunchCyclePreview", function() {
  it("send lunch cycle preview", function() {
    const gatewaySpy = { sendMessage: sinon.fake.returns(true) };
    const useCase = new SendLunchCyclePreview({ gateway: gatewaySpy });

    const response = useCase.execute({message: ""});

    expect(gatewaySpy.sendMessage).to.have.been.calledWith(sinon.match.instanceOf(SlackMessage));
    expect(response.isSent).to.equal(true);
  });
});
