require("module-alias/register");

class SendDirectMessageToSlackUser {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.slackUserLunchCycleGateway = options.slackUserLunchCycleGateway;
    this.generateSlackMessage = options.generateSlackMessage;
  }

  async execute({ slackUser, lunchCycle }) {
    const firstName = slackUser.profile.first_name;
    const slackMessageResponse = await this.slackGateway.sendMessage(
      slackUser,
      this.generateSlackMessage.execute({ lunchCycle, firstName })
    );

    const slackUserLunchCycle = await this.slackUserLunchCycleGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    return {
      slackMessageResponse,
      slackUserLunchCycle
    };
  }
}

module.exports = SendDirectMessageToSlackUser;
