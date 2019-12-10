class FindNonResponderIds { ///can remove once replaced
  constructor({ luncherAvailabilityGateway, lunchCycleGateway }) {
    this.luncherAvailabilityGateway = luncherAvailabilityGateway;
    this.lunchCycleGateway = lunchCycleGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    const lunchers = await this.luncherAvailabilityGateway.getUsersWithoutResponse({ lunch_cycle_id: lunchCycle.id });
    
    return {
      nonResponderIds: lunchers
    };
  }
}

module.exports = FindNonResponderIds;
