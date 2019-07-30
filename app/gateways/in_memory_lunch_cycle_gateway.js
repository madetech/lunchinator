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

  findById(wantedId) {
    return this.all().filter(lc => lc.id === wantedId)[0];
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
