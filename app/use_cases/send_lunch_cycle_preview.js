class SendLunchCyclePreview {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute({ message }) {
    const isSent = this.gateway.sendMessageWithBlocks(message);
    return { isSent: isSent };
  }
}

module.exports = SendLunchCyclePreview;
