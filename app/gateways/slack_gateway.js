require("module-alias/register");
const Slack = require("slack");
const config = require("@app/config");

class SlackGateway {
  async fetchUsers() {
    const response = await this._slackClient()
      .users.list()
      .catch(err => null);

    if (response === null) {
      throw new SlackGatewayError("error fetching the users from slack.");
    }

    return response.members.filter(
      user => user.profile.email && !user.deleted && !user.is_bot && !user.is_ultra_restricted
    );
  }

  async sendMessage(slackUser, message) {
    const response = await this._slackClient()
      .chat.postMessage({
        channel: slackUser.id,
        blocks: message.blocks,
        text: "",
        as_user: true
      })
      .catch(err => null);

    if (response === null) {
      throw new SlackGatewayError("error sending message.");
    }

    return response;
  }

  async sendDirectMessage(slackUserId, message) {
    const response = await this._slackClient()
      .chat.postMessage({
        channel: slackUserId,
        text: message.text,
        as_user: true
      })
      .catch(err => null);

    if (response === null) {
      throw new SlackGatewayError("error reminder sending message.");
    }

    return response;
  }

  async fetchReactionsFromMessage({ timestamp, channel }) {
    const response = await this._slackClient()
      .reactions.get({
        channel,
        timestamp
      })
      .catch(err => null);

    if (response === null) {
      throw new SlackGatewayError("error fetching reactions.");
    }

    return response;
  }

  _slackClient() {
    return new Slack({ token: config.SLACK_BOT_TOKEN });
  }
}

class SlackGatewayError extends Error {
  constructor(message) {
    super(message);
    this.name = "SlackGatewayError";
  }
}

module.exports = {
  SlackGateway,
  SlackGatewayError
};
