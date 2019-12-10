class GetCurrentUserAvailabilities {

  constructor({ luncherAvailabilityGateway, lunchCycleGateway }) {
    this.luncherAvailabilityGateway = luncherAvailabilityGateway;
    this.lunchCycleGateway = lunchCycleGateway
  }

  async execute() {
    const currentLunchCycle = await this.lunchCycleGateway.getCurrent();
    const availableUsers = await this.luncherAvailabilityGateway.getAvailableUsers({lunch_cycle_id: currentLunchCycle.id });
    return {
      lunchCycle: currentLunchCycle,
      availableUsers: availableUsers
    }
  }
}

module.exports = GetCurrentUserAvailabilities;
