class InMemorySlackUserLunchCycleGateway {
  constructor() {
    this.slackUserLunchCycles = [];
  }

  async create({ slackUser, slackMessageResponse, lunchCycle }) {
    const newSlackUserLunchCycle = {
      userId: slackUser.id,
      email: slackUser.profile.email,
      firstName: slackUser.profile.first_name,
      messageChannel: slackMessageResponse.channel,
      messageId: slackMessageResponse.ts,
      lunchCycleId: lunchCycle.id,
      availableEmojis: []
    };

    this.slackUserLunchCycles.push(newSlackUserLunchCycle);

    return newSlackUserLunchCycle;
  }

  async save({ slackUserLunchCycle }) {
    const foundSlackUserLunchCycle = this.slackUserLunchCycles.find(sulc => {
      return (
        sulc.userId === slackUserLunchCycle.userId &&
        sulc.lunchCycleId === slackUserLunchCycle.lunchCycleId
      );
    });

    if (foundSlackUserLunchCycle) {
      foundSlackUserLunchCycle.availableEmojis = slackUserLunchCycle.availableEmojis;

      return foundSlackUserLunchCycle;
    }

    return null;
  }

  async count() {
    return this.slackUserLunchCycles.length;
  }
}

module.exports = InMemorySlackUserLunchCycleGateway;
