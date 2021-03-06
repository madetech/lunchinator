require("module-alias/register");
const Slack = require("slack");
const config = require("@app/config");
const requestPromise = require("request-promise");

class SlackGateway {
  async fetchUsers() {
    const response = await this._slackClient()
      .users.list()
      .catch(err => null);

    if (response === null) {
      throw new SlackGatewayError("error fetching the users from slack.");
    }

    return response.members.filter(
      user => user.profile.email && !(user.deleted || user.is_bot || user.is_ultra_restricted || user.is_restricted)
    );
  }

  async sendMessageWithBlocks(slackUser, message) {
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

  async sendMessageWithText(slackUserId, message) {
    const response = await this._slackClient()
      .chat.postMessage({
        channel: slackUserId,
        text: message.text,
        as_user: true
      })
      .catch(err => {
        console.log(err);
        return null;
      });

    if (response === null) {
      throw new SlackGatewayError("error sending reminder message.");
    }

    return response;
  }

  async sendInteractiveMessageResponse(responseURL, message) {
    return requestPromise({ url: responseURL, method: "POST", json: true, body: {
      replace_original: true,
      blocks: message.blocks,
      text: "",
    }}).catch(err => {
      console.log(err);
      throw new SlackGatewayError("error sending updated message", err.message);
    });
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
