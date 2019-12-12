// const { GenerateLunchersMessage } = require("@use_cases")
const { LunchCycle } = require("@domain")


class ProcessLuncherResponse {
  constructor(options) {
    this.luncherAvailabilityGateway = options.luncherAvailabilityGateway;
    this.lunchCycleGateway = options.lunchCycleGateway;
    this.generateLunchersMessage = options.generateLunchersMessage;
    this.slackGateway = options.slackGateway;
  }

  async execute(payload) {
    const parsedValues = this._parseValue(payload.actions[0].value);
    const slack_user_id = payload.user.id;
    const restaurant_name = parsedValues.restaurant_name;
    const lunch_cycle_id = parsedValues.lunch_cycle_id;
    const button_name = payload.actions[0].text.text;
    const responseURL = payload.response_url
    const realName = payload.user.name

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
    
    const lunchCycle = await this.lunchCycleGateway.findById(lunch_cycle_id)

    const message = this.generateLunchersMessage.execute({ lunchCycle: lunchCycle, realName: realName, available: available })

    const interactiveMessageReturn = await this.slackGateway.sendInteractiveMessageResponse(responseURL, message) 
    console.log("INTERACTIVE MESS:", interactiveMessageReturn);  // todo // tested undefined, works with stub filled sort of
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
