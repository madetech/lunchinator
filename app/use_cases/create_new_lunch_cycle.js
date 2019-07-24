require("module-alias/register");
const LunchCycle = require("@domain/lunch_cycle");

class CreateNewLunchCycle {
  constructor(options) {
    this.gateway = options.gateway;
    this.isValidLunchinatorUser = options.isValidLunchinatorUser;
  }

  execute(request) {
    var isValidUserResponse = this.isValidLunchinatorUser.execute({ userId: request.userId });

    if (isValidUserResponse.isValid) {
      const lunchCycle = this.gateway.create(new LunchCycle());

      return { lunchCycle };
    }
  }
}

module.exports = CreateNewLunchCycle;
