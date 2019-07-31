require("module-alias/register");
const { SlackMessage } = require("@domain");

class SendDirectMessageToSlackUser {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.slackUserResponseGateway = options.slackUserResponseGateway;
  }

  async execute({ slackUser, lunchCycle }) {
    const slackMessageResponse = await this.slackGateway.sendMessage(slackUser, new SlackMessage());

    const slackUserResponse = await this.slackUserResponseGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    return {
      slackMessageResponse,
      slackUserResponse
    };
  }
}

module.exports = SendDirectMessageToSlackUser;
