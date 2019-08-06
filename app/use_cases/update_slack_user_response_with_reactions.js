class UpdateSlackUserResponseWithReactions {
  constructor(options) {
    this.slackUserResponseGateway = options.slackUserResponseGateway;
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute({ slackUserResponse, reactions }) {
    const lunchCycle = await this.lunchCycleGateway.findById(slackUserResponse.lunchCycleId);
    const emojis = [];

    const selectedEmojis = reactions.message.reactions.map(r => r.name).join("|");
    lunchCycle.restaurants.map(restaurant => {
      if (restaurant.emoji.match(new RegExp(`(${selectedEmojis})`))) {
        emojis.push(restaurant.emoji);
      }
    });

    const updatedSlackUserResponse = await this.slackUserResponseGateway.saveEmojis({
      slackUserResponse,
      emojis
    });

    return { updatedSlackUserResponse };
  }
}

module.exports = UpdateSlackUserResponseWithReactions;
