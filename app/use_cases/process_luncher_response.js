class ProcessLuncherResponse {

  constructor(options) {
    this.luncherAvailabilityGateway = options.luncherAvailabilityGateway
    this.lunchCycleDrawGateway = options.lunchCycleDrawGateway
  }

  async execute(payload) {
    const currentLunchCycle = await this.lunchCycleDrawGateway.getCurrent()
    this.luncherAvailabilityGateway.addAvailability({
       userid: payload.user.id,
       lunchCycleId: currentLunchCycle.lunch_cycle_id,
       restaurantName: payload.actions[0].value
    })
  }
}

module.exports = ProcessLuncherResponse;
