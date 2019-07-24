class GetPreviousLunchCycle {
  constructor(options) {
    this.lunchCycleGateway = options.lunchCycleGateway;
  }

  execute(lunchCycle) {
    const foundLunchCycle = this.lunchCycleGateway.findPrevious(lunchCycle);

    return { previousLunchCycle: foundLunchCycle };
  }
}

module.exports = GetPreviousLunchCycle;
