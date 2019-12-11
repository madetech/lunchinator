class Luncher {
  static newFromDb(dbObject) {
    return new Luncher({
      slackUserId: dbObject.slack_user_id,
      lunchCycleId: dbObject.lunch_cycle_id,
      email: dbObject.email,
      realName: dbObject.real_name,
      messageChannel: dbObject.message_channel,
      messageId: dbObject.message_id,
      availableEmojis: dbObject.available_emojis,
      restaurantName: dbObject.restaurant_name,
      available: dbObject.available
    });
  }

  constructor(options) {
    this.slackUserId = options.slackUserId;
    this.lunchCycleId = options.lunchCycleId;
    this.email = options.email;
    this.realName = options.realName;
    this.messageChannel = options.messageChannel;
    this.messageId = options.messageId;
    this.availableEmojis = options.availableEmojis || [];
    this.restaurantName = options.restaurantName;
    this.available = options.available;
  }
}

module.exports = Luncher;
