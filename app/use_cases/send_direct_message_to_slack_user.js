require("module-alias/register");
const { SlackMessage } = require("@domain");

class SendDirectMessageToSlackUser {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.slackUserLunchCycleGateway = options.slackUserLunchCycleGateway;
  }

  execute(options) {
    const { slackUser, lunchCycle } = options;
    const slackMessageResponse = this.slackGateway.sendMessage(slackUser, new SlackMessage());

    const slackUserLunchCycleResponse = this.slackUserLunchCycleGateway.recordSlackUserLunchCycle(
      slackUser,
      slackMessageResponse,
      lunchCycle
    );

    return {
      slackMessageResponse,
      slackUserLunchCycle: slackUserLunchCycleResponse.slackUserLunchCycle
    };
  }
}

module.exports = SendDirectMessageToSlackUser;
