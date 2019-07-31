class FetchReactionsForSlackUserLunchCycle {
  constructor(options) {
    this.slackGateway = options.slackGateway;
  }

  async execute({ slackUserLunchCycle }) {
    const reactions = await this.slackGateway.fetchReactionsFromMessage({
      timestamp: slackUserLunchCycle.messageId,
      channel: slackUserLunchCycle.messageChannel
    });

    return { reactions };
  }
}

module.exports = FetchReactionsForSlackUserLunchCycle;
