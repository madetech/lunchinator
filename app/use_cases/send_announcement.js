const config = require("@app/config");

class SendAnnouncement {
  constructor({ slackGateway, generateAnnouncementsMessage }) {
    (this.slackGateway = slackGateway),
      (this.generateAnnouncementsMessage = generateAnnouncementsMessage);
  }
  async execute({ lunchCycleWeek }) {
    const message = this.generateAnnouncementsMessage.execute({ lunchCycleWeek });
    const slackGatewayResponse = await this.slackGateway.sendMessageWithText(
      config.ANNOUNCEMENTS_CHANNEL,
      message
    );
    return slackGatewayResponse;
  }
}
module.exports = SendAnnouncement;
