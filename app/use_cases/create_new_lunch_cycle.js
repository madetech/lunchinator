require("module-alias/register");
const moment = require("moment");
const { LunchCycle } = require("@domain");

class CreateNewLunchCycle {
  constructor(options) {
    this.lunchCycleGateway = options.lunchCycleGateway;
    this.isValidLunchinatorUser = options.isValidLunchinatorUser;
  }

  async execute({ userId, restaurants, startsAt: startsAt }) {
    var isValidUserResponse = this.isValidLunchinatorUser.execute({ userId: userId });

    if (!isValidUserResponse.isValid) {
      return {
        error: "unauthorised slack user."
      };
    }

    if (!restaurants || !restaurants.length) {
      return {
        error: "invalid list of restaurants."
      };
    }

    const startsAtIsoString = this.parseDateToIsoString(startsAt);

    if (!startsAt || !startsAtIsoString) {
      return {
        error: "invalid start date."
      };
    }

    const lunchCycle = await this.lunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants,
        starts_at: startsAtIsoString
      })
    );

    return { lunchCycle };
  }

  parseDateToIsoString(dateString) {
    const mo = moment.utc(dateString, "DD-MM-YYYY");

    if (mo.isValid()) {
      return mo.toDate().toISOString();
    }
  }
}

module.exports = CreateNewLunchCycle;
