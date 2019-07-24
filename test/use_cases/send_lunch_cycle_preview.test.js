const { expect, sinon } = require("../test_helper");
const SendLunchCyclePreview = require("@use_cases/send_lunch_cycle_preview");
const SlackMessage = require("@domain/slack_message");

describe("SendLunchCyclePreview", function() {
  it("send lunch cycle preview", function() {
    const gatewaySpy = { sendMessage: sinon.fake.returns(true) };
    const useCase = new SendLunchCyclePreview({ gateway: gatewaySpy });

    const response = useCase.execute();

    expect(gatewaySpy.sendMessage).to.have.been.calledWith(sinon.match.instanceOf(SlackMessage));
    expect(response.slackResponse).to.equal(true);
  });
});
