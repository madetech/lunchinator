class GetLastLunchCycle {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    return { lastLunchCycle: this.gateway.last() };
  }
}

module.exports = GetLastLunchCycle;
