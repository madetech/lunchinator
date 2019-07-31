class GetPreviousLunchCycle {
  constructor(options) {
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  async execute() {
    const foundLunchCycle = await this.lunchCycleGateway.findPrevious();

    return { previousLunchCycle: foundLunchCycle };
  }
}

module.exports = GetPreviousLunchCycle;
