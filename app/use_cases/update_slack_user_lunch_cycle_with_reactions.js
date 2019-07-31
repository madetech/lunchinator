class UpdateSlackUserLunchCycleWithReactions {
  constructor(options) {
    this.slackUserLunchCycleGateway = options.slackUserLunchCycleGateway;
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute({ slackUserLunchCycle, reactions }) {
    const lunchCycle = await this.lunchCycleGateway.findById(slackUserLunchCycle.lunchCycleId);

    const selectedEmojis = reactions.message.reactions.map(r => r.name).join("|");

    lunchCycle.restaurants.map(restaurant => {
      if (restaurant.emoji.match(new RegExp(`(${selectedEmojis})`))) {
        slackUserLunchCycle.availableEmojis.push(restaurant.emoji);
      }
    });

    const updatedSlackUserLunchCycle = this.slackUserLunchCycleGateway.save(slackUserLunchCycle);

    return { slackUserLunchCycle: updatedSlackUserLunchCycle };
  }
}

module.exports = UpdateSlackUserLunchCycleWithReactions;
