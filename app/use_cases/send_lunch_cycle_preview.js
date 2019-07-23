require("module-alias/register");
const SlackMessage = require("@domain/slack_message");

class SendLunchCyclePreview {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    return this.gateway.sendMessage(new SlackMessage());
  }
}

module.exports = SendLunchCyclePreview;
