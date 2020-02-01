const config = require("@app/config");
const moment = require("moment");
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

    // get the next friday n number of weeks from now
    const startsAt = moment()
      .utc()
      .add(config.WEEKS_BEFORE_CYCLE_STARTS, 'weeks')
      .isoWeekday("Friday");

    if (!startsAt || !this.isValidDate(startsAt)) {
      return {
        error: "invalid start date."
      };
    }

    this.setRestaurantDates(restaurants, startsAt);

    const lunchCycle = await this.lunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants,
        starts_at: startsAt.format()
      })
    );

    return { lunchCycle };
  }

  isValidDate(date) {
    const clone = date.clone().endOf("day");
    return clone.isValid() && clone.isAfter();
  }

  setRestaurantDates(restaurants, startsAt) {
    restaurants.forEach((r, i) => {
      const clone = startsAt.clone();
      r.date = clone.add(i * 7, "days").format("DD/MM/YYYY");
    });
  }
}

module.exports = CreateNewLunchCycle;
