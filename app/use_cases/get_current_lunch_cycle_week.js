const moment = require("moment");
class GetCurrentLunchCycleWeek {
  constructor({ lunchCycleDrawGateway }) {
    this.lunchCycleDrawGateway = lunchCycleDrawGateway;
  }
  async execute() {
    const friday = moment()
      .day("Friday")
      .format("DD/MM/YYYY");
    const lunchCycleWeeks = await this.lunchCycleDrawGateway.getCurrent();
    const lunchCycleWeek = lunchCycleWeeks.filter(
      lunchCycleWeek => lunchCycleWeek.restaurant.date == friday
    );
    return { lunchCycleWeek: lunchCycleWeek[0] };
  }
}

module.exports = GetCurrentLunchCycleWeek;
