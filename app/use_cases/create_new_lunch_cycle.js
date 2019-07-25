require("module-alias/register");
const { LunchCycle } = require("@domain");

class CreateNewLunchCycle {
  constructor(options) {
    this.lunchCycleGateway = options.lunchCycleGateway;
    this.isValidLunchinatorUser = options.isValidLunchinatorUser;
  }

  execute(request) {
    var isValidUserResponse = this.isValidLunchinatorUser.execute({ userId: request.userId });

    if (isValidUserResponse.isValid) {
      const lunchCycle = this.lunchCycleGateway.create(new LunchCycle());

      return { lunchCycle };
    }

    return { lunchCycle: null };
  }
}

module.exports = CreateNewLunchCycle;
