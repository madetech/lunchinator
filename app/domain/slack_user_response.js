class SlackUserResponse {
  static newFromDb(dbObject) {
    return new SlackUserResponse({
      slackUserId: dbObject.slack_user_id,
      lunchCycleId: dbObject.lunch_cycle_id,
      email: dbObject.email,
      firstName: dbObject.first_name,
      messageChannel: dbObject.message_channel,
      messageId: dbObject.message_id,
      availableEmojis: dbObject.available_emojis
    });
  }

  constructor(options) {
    this.slackUserId = options.slackUserId;
    this.lunchCycleId = options.lunchCycleId;
    this.email = options.email;
    this.firstName = options.firstName;
    this.messageChannel = options.messageChannel;
    this.messageId = options.messageId;
    this.availableEmojis = options.availableEmojis || [];
  }
}

module.exports = SlackUserResponse;
