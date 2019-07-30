require("module-alias/register");
const Slack = require("slack");
const config = require("@app/config");

class SlackGateway {
  async fetchUsers() {
    const users = await this._slackClient().users.list();

    return users.members.filter(
      user => user.profile.email && !user.deleted && !user.is_bot && !user.is_ultra_restricted
    );
  }

  _slackClient() {
    return new Slack({ token: config.SLACK_BOT_TOKEN });
  }
}

module.exports = SlackGateway;
