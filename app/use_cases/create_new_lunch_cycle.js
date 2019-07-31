require("module-alias/register");
const { LunchCycle } = require("@domain");

class CreateNewLunchCycle {
  constructor(options) {
    this.lunchCycleGateway = options.lunchCycleGateway;
    this.isValidLunchinatorUser = options.isValidLunchinatorUser;
  }

  async execute(request) {
    var isValidUserResponse = this.isValidLunchinatorUser.execute({ userId: request.userId });

    if (isValidUserResponse.isValid) {
      let lunchCycleOptions = {};

      if (request.restaurants) {
        lunchCycleOptions.restaurants = request.restaurants;
      }

      const lunchCycle = await this.lunchCycleGateway.create(new LunchCycle(lunchCycleOptions));

      return { lunchCycle };
    }

    return { lunchCycle: null };
  }
}

module.exports = CreateNewLunchCycle;
