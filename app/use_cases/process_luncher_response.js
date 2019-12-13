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
    
    //get all current lunch cycle avalibltys for this user
    
    const lunchCycle = await this.lunchCycleGateway.findById(lunch_cycle_id)

    const userAvalilbity = await this.luncherAvailabilityGateway.getUserAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: slack_user_id
    })
    const userAvalilbityMap = this._generateUserAvalilbityMap(userAvalilbity)

    const message = this.generateLunchersMessage.execute({ lunchCycle: lunchCycle, realName: realName, available: userAvalilbityMap})

    this.slackGateway.sendInteractiveMessageResponse(responseURL, message) 
  }
  
  _generateUserAvalilbityMap(userAvalilbityArray) {
    const userAvalilbityMap = {}
    userAvalilbityArray.forEach(userResponse => {
      userAvalilbityMap[userResponse.restaurantName] = userResponse.available
    });
    return userAvalilbityMap
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
