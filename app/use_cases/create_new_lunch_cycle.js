require("module-alias/register");
const LunchCycle = require("@app/domain/lunch_cycle");

class CreateNewLunchCycle {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    this.gateway.create(new LunchCycle());
  }
}

module.exports = CreateNewLunchCycle;
