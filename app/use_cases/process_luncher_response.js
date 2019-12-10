class ProcessLuncherResponse {
  constructor(options) {
    this.luncherAvailabilityGateway = options.luncherAvailabilityGateway;
  }

  async execute(payload) {
    const parsedValues = this._parseValue(payload.actions[0].value);
    const slack_user_id = payload.user.id;
    const restaurant_name = parsedValues.restaurant_name;
    const lunch_cycle_id = parsedValues.lunch_cycle_id;
    const button_name = payload.actions[0].text.text;
    let available;

    if (button_name == "Unavailable") {
      available = false;
    } else {
      available = true;
    }

    await this.luncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunch_cycle_id,
      slack_user_id: slack_user_id,
      restaurant_name: restaurant_name,
      available: available
    });
  }
  

  _parseValue(value) {
    let values = value.split(/-(.+)/);
    return {
      lunch_cycle_id: parseInt(values[0]),
      restaurant_name: values[1]
    };
  }
}

module.exports = ProcessLuncherResponse;
