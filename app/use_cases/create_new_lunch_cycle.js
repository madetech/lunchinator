require("module-alias/register");
const moment = require("moment");
const config = require("@app/config");
const { LunchCycle } = require("@domain");

class CreateNewLunchCycle {
  constructor(options) {
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute({ restaurants }) {
    if (!restaurants || !restaurants.length) {
      return {
        error: "invalid list of restaurants."
      };
    }

    // finds the friday after WEEKS_BEFORE_CYCLE_STARTS weeks
    const startsAt = moment
      .utc()
      .startOf("isoWeek")
      .add(4, "days")
      .add(config.WEEKS_BEFORE_CYCLE_STARTS, "week")
      .format();

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
    const mo = moment(new Date(dateString));
    return mo.isValid() && mo.isAfter();
  }
}

module.exports = CreateNewLunchCycle;
