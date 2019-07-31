const config = require("@app/config");
const moment = require("moment");

class LunchCycleService {
  constructor(options) {
    this.createNewLunchCycle = options.createNewLunchCycle;
    this.verifySlackRequest = options.verifySlackRequest;
    this.getNewLunchCycleRestaurants = options.getNewLunchCycleRestaurants;
    this.generateSlackPreviewMessage = options.generateSlackPreviewMessage;
  }

  async createLunchCycle({ userId, restaurants }) {
    const weeksBeforeCycleStarts = config.WEEKS_BEFORE_CYCLE_STARTS;

    const startsAt = moment
      .utc()
      .startOf("isoWeek")
      .add(4, "days")
      .add(weeksBeforeCycleStarts, "week")
      .format("DD-MM-YYYY");

    const response = await this.createNewLunchCycle.execute({
      userId: userId,
      restaurants: restaurants,
      startsAt: startsAt
    });

    return response;
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
    const response = this.generateSlackPreviewMessage.execute({
      lunchCycle: lunchCycle
    });

    return response.message;
  }
}

module.exports = LunchCycleService;
