const config = require("@app/config");
const moment = require("moment");

class LunchCycleService {
  constructor(options) {
    this.createNewLunchCycle = options.createNewLunchCycle;
    this.verifySlackRequest = options.verifySlackRequest;
    this.getNewLunchCycleRestaurants = options.getNewLunchCycleRestaurants;
    this.generateSlackMessage = options.generateSlackMessage;
    this.isLunchinatorAdmin = options.isLunchinatorAdmin;
    this.fetchAllSlackUsers = options.fetchAllSlackUsers;
    this.sendDirectMessageToSlackUser = options.sendDirectMessageToSlackUser;
    this.fetchReactionsForSlackUserResponse = options.fetchReactionsForSlackUserResponse;
    this.updateSlackUserResponseWithReactions = options.updateSlackUserResponseWithReactions;
    this.exportSlackUserResponsesForLunchCycleToGoogleSheet =
      options.exportSlackUserResponsesForLunchCycleToGoogleSheet;
  }

  async createLunchCycle({ userId, restaurants }) {
    const weeksBeforeCycleStarts = config.WEEKS_BEFORE_CYCLE_STARTS;

    const startsAt = moment
      .utc()
      .startOf("isoWeek")
      .add(4, "days")
      .add(weeksBeforeCycleStarts, "week")
      .format();

    const response = await this.createNewLunchCycle.execute({
      userId: userId,
      restaurants: restaurants,
      startsAt: startsAt
    });

    return response;
  }

  isAdmin(userId) {
    var isLunchinatorAdminResponse = this.isLunchinatorAdmin.execute({ userId: userId });
    return isLunchinatorAdminResponse.isValid;
  }

  verifyRequest(headers, body) {
    const response = this.verifySlackRequest.execute({
      slackSignature: headers["x-slack-signature"],
      timestamp: headers["x-slack-request-timestamp"],
      body: body
    });

    return response.isVerified;
  }

  async getLunchCycleRestaurants() {
    const response = await this.getNewLunchCycleRestaurants.execute();
    return response.restaurants;
  }

  getPreviewMessage(lunchCycle) {
    const response = this.generateSlackMessage.execute({
      lunchCycle: lunchCycle
    });

    return response.text;
  }

  async fetchSlackUsers() {
    const response = await this.fetchAllSlackUsers.execute();

    return response.slackUsers;
  }

  async sendMessagesToSlackUsers(slackUsers) {
    slackUsers.forEach(async slackUser => {
      await this.sendDirectMessageToSlackUser.execute({ slackUser });
    });
  }

  async fetchReactionsFromSlackUserResponses({ slackUserResponses }) {
    for (const slackUserResponse of slackUserResponses) {
      const reactions = await this.fetchReactionsForSlackUserResponse.execute({
        slackUserResponse
      });

      await this.updateSlackUserResponseWithReactions.execute({ slackUserResponse, reactions });
    }
  }

  async exportResponsesToGoogleSheet({ lunchCycle }) {
    await this.exportSlackUserResponsesForLunchCycleToGoogleSheet.execute({ lunchCycle });
  }
}

module.exports = LunchCycleService;
