class FindNonResponderIds {
  constructor({ userResponseGateway, lunchCycleGateway }) {
    this.userResponseGateway = userResponseGateway;
    this.lunchCycleGateway = lunchCycleGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    const lunchers = await this.userResponseGateway.findAllForLunchCycle({ lunchCycle });

    const nonResponders = lunchers
      .filter(user => user.availableEmojis.length === 0)
      .map(user => user.slackUserId);

    return {
      nonResponders
    };
  }
}

module.exports = FindNonResponderIds;
