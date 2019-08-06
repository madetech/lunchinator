const moment = require("moment");

class GenerateSlackMessage {
  execute({ lunchCycle, firstName }) {
    const blocks = []

    if (!firstName) {
      firstName = "{first name}";
    }
    // let message = `\*Hey\* ${firstName}! It’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n`;

    blocks.push(
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `\*Hey\* ${firstName}! It’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n`
        }
      },
      {
        "type": "divider"
      }
    )

    lunchCycle.restaurants.forEach((r, i) => {
      const nextDate = moment.utc(lunchCycle.starts_at).add(i * 7, "days");

      blocks.push(
        {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${r.emoji} ${nextDate.format("DD/MM/YYYY")} ${r.name} vegan:${
            r.dietaries.vegan
          }, meat:${r.dietaries.meat} ${r.direction}\n`
        }
      }, {
        "type": "divider"
      })

      // message += `${r.emoji} ${nextDate.format("DD/MM/YYYY")} ${r.name} vegan:${
      //   r.dietaries.vegan
      // }, meat:${r.dietaries.meat} ${r.direction}\n`;
    });

    return {
      blocks: blocks
    };
  }
}

module.exports = GenerateSlackMessage;
