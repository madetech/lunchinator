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

  findPrevious(lunchCycle) {
    return this.all()
      .reverse()
      .find(currentLunchCycle => currentLunchCycle.id < lunchCycle.id);
  }

  count() {
    return this.lunchCycles.length;
  }
}

module.exports = InMemoryLunchCycleGateway;
