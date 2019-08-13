class SendReminderToLateResponder {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.generateReminderMessage = options.generateReminderMessage;
  }

  async execute({ slackUserId }) {
    const slackMessageResponse = await this.slackGateway.sendMessageWithText(
      slackUserId,
      this.generateReminderMessage.execute({ slackUserId })
    );

    return {
      slackMessageResponse
    };
  }
}
module.exports = SendReminderToLateResponder;
