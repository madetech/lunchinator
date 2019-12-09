const { Luncher } = require("@domain");

class InMemorySlackUserResponseGateway {
  constructor() {
    this.lunchers = [];
  }

  async create({ slackUser, slackMessageResponse, lunchCycle }) {
    const luncher = new Luncher({
      slackUserId: slackUser.id,
      email: slackUser.profile.email,
      firstName: slackUser.profile.first_name,
      messageChannel: slackMessageResponse.channel,
      messageId: slackMessageResponse.ts,
      lunchCycleId: lunchCycle.id,
      availableEmojis: []
    });

    this.lunchers.push(luncher);

    return luncher;
  }

  async count() {
    return this.lunchers.length;
  }
}

module.exports = InMemorySlackUserResponseGateway;
