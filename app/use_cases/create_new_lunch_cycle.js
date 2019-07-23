require("module-alias/register");
const LunchCycle = require("@domain/lunch_cycle");

class CreateNewLunchCycle {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    this.gateway.create(new LunchCycle());
  }
}

module.exports = CreateNewLunchCycle;
