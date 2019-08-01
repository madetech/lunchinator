require("module-alias/register");
const { SlackUserResponse } = require("@domain");

class InMemorySlackUserResponseGateway {
  constructor() {
    this.slackUserResponses = [];
  }

  async findAllForLunchCycle({ lunchCycle }) {
    return this.slackUserResponses.filter(sur => sur.lunchCycleId === lunchCycle.id);
  }

  async create({ slackUser, slackMessageResponse, lunchCycle }) {
    const newSlackUserResponse = new SlackUserResponse({
      slackUserId: slackUser.id,
      email: slackUser.profile.email,
      firstName: slackUser.profile.first_name,
      messageChannel: slackMessageResponse.channel,
      messageId: slackMessageResponse.ts,
      lunchCycleId: lunchCycle.id,
      availableEmojis: []
    });

    this.slackUserResponses.push(newSlackUserResponse);

    return newSlackUserResponse;
  }

  async save({ slackUserResponse }) {
    const foundSlackUserResponse = this.slackUserResponses.find(sulc => {
      return (
        sulc.slackUserId === slackUserResponse.slackUserId &&
        sulc.lunchCycleId === slackUserResponse.lunchCycleId
      );
    });

    if (foundSlackUserResponse) {
      foundSlackUserResponse.availableEmojis = slackUserResponse.availableEmojis;

      return foundSlackUserResponse;
    }

    return null;
  }

  async count() {
    return this.slackUserResponses.length;
  }
}

module.exports = InMemorySlackUserResponseGateway;
