const moment = require("moment");

class GenerateSlackMessage {
  execute({ lunchCycle, firstName }) {
    if (!firstName) {
      firstName = "{first name}";
    }
    let message = `Hey ${firstName}! It’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n`;

    lunchCycle.restaurants.forEach((r, i) => {
      const nextDate = moment.utc(lunchCycle.starts_at).add(i * 7, "days");
      message += `${r.emoji} ${nextDate.format("DD/MM/YYYY")} ${r.name} vegan:${
        r.dietaries.vegan
      }, meat:${r.dietaries.meat}, direction:${r.direction}\n`;
    });

    return {
      text: message
    };
  }
}

module.exports = GenerateSlackMessage;
