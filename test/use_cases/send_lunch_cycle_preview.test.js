const { expect, sinon } = require("../test_helper");
const SendLunchCyclePreview = require("@use_cases/send_lunch_cycle_preview");
const SlackMessage = require("@domain/slack_message");

describe("SendLunchCyclePreview", function() {
  it("send lunch cycle preview", function() {
    const gatewaySpy = { sendMessage: sinon.spy() };
    const useCase = new SendLunchCyclePreview({ gateway: gatewaySpy });

    useCase.execute();

    expect(gatewaySpy.sendMessage).to.have.been.calledWith(
      sinon.match.instanceOf(SlackMessage)
    );
  });
});
