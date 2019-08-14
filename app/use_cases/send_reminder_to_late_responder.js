class SendReminderToLateResponder {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.generateReminderMessage = options.generateReminderMessage;
  }

  async execute({ nonResponderId }) {
    const slackMessageResponse = await this.slackGateway.sendMessageWithText(
      nonResponderId,
      this.generateReminderMessage.execute({ nonResponderId })
    );

    return {
      slackMessageResponse
    };
  }
}
module.exports = SendReminderToLateResponder;
