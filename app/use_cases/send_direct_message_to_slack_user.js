require("module-alias/register");
const { SlackMessage } = require("@domain");

class SendDirectMessageToSlackUser {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.slackUserLunchCycleGateway = options.slackUserLunchCycleGateway;
  }

  async execute({ slackUser, lunchCycle }) {
    const slackMessageResponse = await this.slackGateway.sendMessage(slackUser, new SlackMessage());

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
