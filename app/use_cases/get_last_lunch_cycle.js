class GetLastLunchCycle {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    return this.gateway.last();
  }
}

module.exports = GetLastLunchCycle;
