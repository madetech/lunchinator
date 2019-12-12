require("module-alias/register");

class SendDirectMessageToSlackUser {
  constructor(options) {
    this.slackGateway = options.slackGateway;
    this.slackUserResponseGateway = options.slackUserResponseGateway;
    this.generateLunchersMessage = options.generateLunchersMessage;
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute({ slackUser }) {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    const realName = slackUser.profile.real_name;
    const slackMessageResponse = await this.slackGateway.sendMessageWithBlocks(
      slackUser,
      this.generateLunchersMessage.execute({ lunchCycle, realName })
    );

    const luncher = await this.slackUserResponseGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    return {
      slackMessageResponse,
      luncher
    };
  }
}

module.exports = SendDirectMessageToSlackUser;
