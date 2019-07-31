class InMemoryLunchCycleGateway {
  constructor() {
    this.lunchCycles = [];
  }

  async create(lunchCycle) {
    lunchCycle.id = this.lunchCycles.length + 1;
    this.lunchCycles.push(lunchCycle);
    return lunchCycle;
  }

  async all() {
    return [...this.lunchCycles];
  }

  async findById(wantedId) {
    const all = await this.all();
    return all.filter(lc => lc.id === wantedId)[0];
  }

  async findPrevious() {
    const all = await this.all();
    return all.reverse()[0];
  }

  async count() {
    return this.lunchCycles.length;
  }
}

module.exports = InMemoryLunchCycleGateway;
