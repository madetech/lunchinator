class FindNonResponderIds {
  constructor({ userResponseGateway, lunchCycleGateway }) {
    this.userResponseGateway = userResponseGateway;
    this.lunchCycleGateway = lunchCycleGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    const users = await this.userResponseGateway.findAllForLunchCycle({ lunchCycle });

    const nonResponderIds = users
      .filter(user => user.availableEmojis.length === 0)
      .map(user => user.slackUserId);

    return {
      nonResponderIds
    };
  }
}

module.exports = FindNonResponderIds;
