class FetchReactionsForSlackUserResponse {
  constructor(options) {
    this.slackGateway = options.slackGateway;
  }

  async execute({ slackUserResponse }) {
    const reactions = await this.slackGateway.fetchReactionsFromMessage({
      timestamp: slackUserResponse.messageId,
      channel: slackUserResponse.messageChannel
    });

    return { reactions };
  }
}

module.exports = FetchReactionsForSlackUserResponse;
