require("module-alias/register");

class SendDirectMessageToSlackUser {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.slackUserResponseGateway = options.slackUserResponseGateway;
    this.generateSlackMessage = options.generateSlackMessage;
  }

  async execute({ slackUser, lunchCycle }) {
    const firstName = slackUser.profile.first_name;
    const slackMessageResponse = await this.slackGateway.sendMessage(
      slackUser,
      this.generateSlackMessage.execute({ lunchCycle, firstName })
    );

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
