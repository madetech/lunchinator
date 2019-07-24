require("module-alias/register");
const LunchCycle = require("@domain/lunch_cycle");

class CreateNewLunchCycle {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    return this.gateway.create(new LunchCycle());
  }
}

module.exports = CreateNewLunchCycle;
