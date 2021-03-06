const { expect, sinon } = require("../test_helper");
const { SendReminderToLateResponder } = require("@use_cases");

describe("SendReminderToLateResponder", function() {
  it("can send a reminder to a late responder", async function() {
    const nonResponderId = "slackUserId";
    const gatewaySpy = { sendMessageWithText: sinon.fake.returns(true) };
    const reminderMessageDummy = { text: "" };
    const generateReminderMessage = { execute: sinon.fake.returns(reminderMessageDummy) };
    const useCase = new SendReminderToLateResponder({
      slackGateway: gatewaySpy,
      generateReminderMessage: generateReminderMessage
    });
    const response = await useCase.execute({ nonResponderId });
    expect(gatewaySpy.sendMessageWithText).to.have.been.calledWith(
      nonResponderId,
      reminderMessageDummy
    );
    expect(response.slackMessageResponse).to.eql(true);
  });
});
