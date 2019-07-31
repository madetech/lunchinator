const moment = require("moment");

class GenerateSlackMessage {
  constructor(options) {
    this.firstName = options.firstName;
  }

  execute({ lunchCycle }) {
    if (this.firstName === "") {
      var message = `Hey {first name}! it’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n`;
    } else {
      var message = `Hey ${this.firstName} it’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n`;
    }

    lunchCycle.restaurants.forEach((r, i) => {
      const nextDate = moment.utc(lunchCycle.starts_at).add(i * 7, "days");
      message += `${r.emoji} ${nextDate.format("DD/MM/YYYY")} ${r.name} vegan:${
        r.dietaries.vegan
      }, meat:${r.dietaries.meat}, direction:${r.direction}\n`;
    });

    return {
      message: message
    };
  }
}

module.exports = GenerateSlackMessage;
