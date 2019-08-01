class UpdateSlackUserResponseWithReactions {
  constructor(options) {
    this.slackUserResponseGateway = options.slackUserResponseGateway;
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute({ slackUserResponse, reactions }) {
    const lunchCycle = await this.lunchCycleGateway.findById(slackUserResponse.lunchCycleId);

    const selectedEmojis = reactions.message.reactions.map(r => r.name).join("|");
    lunchCycle.restaurants.map(restaurant => {
      if (restaurant.emoji.match(new RegExp(`(${selectedEmojis})`))) {
        slackUserResponse.availableEmojis.push(restaurant.emoji);
      }
    });

    const updatedSlackUserResponse = await this.slackUserResponseGateway.save({
      slackUserResponse
    });

    return { slackUserResponse: updatedSlackUserResponse };
  }
}

module.exports = UpdateSlackUserResponseWithReactions;
