require("module-alias/register");
const moment = require("moment");
const { LunchCycle } = require("@domain");

class CreateNewLunchCycle {
  constructor(options) {
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute({ restaurants, startsAt: startsAt }) {
    if (!restaurants || !restaurants.length) {
      return {
        error: "invalid list of restaurants."
      };
    }

    if (!startsAt || !this.isValidDate(startsAt)) {
      return {
        error: "invalid start date."
      };
    }

    const lunchCycle = await this.lunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants,
        starts_at: startsAt
      })
    );

    return { lunchCycle };
  }

  isValidDate(dateString) {
    return moment.utc(dateString).isValid();
  }
}

module.exports = CreateNewLunchCycle;
