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

    const startsAt = moment
      .utc()
      .startOf("isoWeek")
      .add(4, "days")
      .add(config.WEEKS_BEFORE_CYCLE_STARTS, "week");

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
    const clone = startsAt.clone();
    restaurants.forEach((r, i) => {
      r.date = clone.add(i * 7, "days").format("DD/MM/YYYY");
    });
  }
}

module.exports = CreateNewLunchCycle;
