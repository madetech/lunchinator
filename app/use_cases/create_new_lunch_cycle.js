require("module-alias/register");
const LunchCycle = require("@domain/lunch_cycle");

class CreateNewLunchCycle {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    const lunchCycle = this.gateway.create(new LunchCycle());
    return { lunchCycle };
  }
}

module.exports = CreateNewLunchCycle;
