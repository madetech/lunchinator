class SendMessageToSelectedLunchers {
  constructor({ slackGateway, generateSelectedLunchersMessage }) {
    (this.slackGateway = slackGateway),
      (this.generateSelectedLunchersMessage = generateSelectedLunchersMessage);
  }
  async execute({ lunchCycleWeek }) {
    let slackMessageResponses = [];
    while (lunchCycleWeek.lunchers.length > 0) {
      const lunchers = lunchCycleWeek.lunchers;
      lunchers.forEach(async luncher => {
        const message = this.generateSelectedLunchersMessage.execute({ lunchCycleWeek, luncher });
        let slackMessageResponse = await this.slackGateway.sendMessageWithText({
          slackUserId: luncher.slackUserId,
          message: message
        });
        slackMessageResponses.push({ slackMessageResponse: slackMessageResponse });
      });
      return slackMessageResponses;
    }
    return slackMessageResponses;
  }
}
module.exports = SendMessageToSelectedLunchers;
