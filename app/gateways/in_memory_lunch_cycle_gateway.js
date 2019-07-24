class InMemoryLunchCycleGateway {
  constructor() {
    this.lunchCycles = [];
  }

  create(lunchCycle) {
    lunchCycle.id = this.count() + 1;
    this.lunchCycles.push(lunchCycle);
    return lunchCycle;
  }

  all() {
    return [...this.lunchCycles];
  }

  count() {
    return this.lunchCycles.length;
  }
}

module.exports = InMemoryLunchCycleGateway;
