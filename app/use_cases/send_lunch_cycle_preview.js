class SendLunchCyclePreview {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute({ message }) {
    const isSent = this.gateway.sendMessage(message);
    return { isSent: isSent };
  }
}

module.exports = SendLunchCyclePreview;
