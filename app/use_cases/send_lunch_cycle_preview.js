require("module-alias/register");
const SlackMessage = require("@domain/slack_message");

class SendLunchCyclePreview {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    const slackResponse = this.gateway.sendMessage(new SlackMessage());
    return { slackResponse };
  }
}

module.exports = SendLunchCyclePreview;
