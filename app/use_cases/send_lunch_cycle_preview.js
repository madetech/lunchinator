require("module-alias/register");
const { SlackMessage } = require("@domain");

class SendLunchCyclePreview {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute({message}) {
    const isSent = this.gateway.sendMessage(new SlackMessage(message));
    return { isSent: isSent };
  }
}

module.exports = SendLunchCyclePreview;
