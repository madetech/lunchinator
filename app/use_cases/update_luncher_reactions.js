class UpdateLuncherReactions {
  constructor(options) {
    this.slackUserResponseGateway = options.slackUserResponseGateway;
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute({ luncher, reactions }) {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    const emojis = [];

    if (reactions.message.reactions) {
      const selectedEmojis = reactions.message.reactions.map(r => r.name).join("|");

      lunchCycle.restaurants.map(restaurant => {
        if (restaurant.emoji.match(new RegExp(`(${selectedEmojis})`))) {
          emojis.push(restaurant.emoji);
        }
      });
    }

    const updatedLuncher = await this.slackUserResponseGateway.saveEmojis({ luncher, emojis });

    return { updatedLuncher };
  }
}

module.exports = UpdateLuncherReactions;
