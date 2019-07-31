class SlackUserResponse {
  static newFromDb(dbObject) {
    let availableEmojis = [];

    if (dbObject.available_emojis) {
      availableEmojis = JSON.parse(dbObject.available_emojis);
    }

    return new SlackUserResponse({
      slackUserId: dbObject.slack_user_id,
      lunchCycleId: dbObject.lunch_cycle_id,
      email: dbObject.email,
      firstName: dbObject.first_name,
      messageChannel: dbObject.message_channel,
      messageId: dbObject.message_id,
      availableEmojis: availableEmojis
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
