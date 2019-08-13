const { Luncher } = require("@domain");

class InMemorySlackUserResponseGateway {
  constructor() {
    this.lunchers = [];
  }

  async findAllForLunchCycle({ lunchCycle }) {
    return this.lunchers.filter(sur => sur.lunchCycleId === lunchCycle.id);
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

  async saveEmojis({ luncher, emojis }) {
    const foundLuncher = this.lunchers.find(l => {
      return l.slackUserId === luncher.slackUserId && l.lunchCycleId === luncher.lunchCycleId;
    });

    if (foundLuncher) {
      foundLuncher.availableEmojis = emojis;
      return foundLuncher;
    }

    return null;
  }

  async count() {
    return this.lunchers.length;
  }
}

module.exports = InMemorySlackUserResponseGateway;
