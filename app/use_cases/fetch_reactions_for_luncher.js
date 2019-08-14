class FetchReactionsForLuncher {
  constructor(options) {
    this.slackGateway = options.slackGateway;
  }

  async execute({ luncher }) {
    const reactions = await this.slackGateway.fetchReactionsFromMessage({
      timestamp: luncher.messageId,
      channel: luncher.messageChannel
    });

    return { reactions };
  }
}

module.exports = FetchReactionsForLuncher;
