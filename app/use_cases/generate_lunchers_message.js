const moment = require("moment");

class GenerateLunchersMessage {
  execute({ lunchCycle, realName }) {
    const blocks = [];
    let preview = "";
    if (!realName) {
      realName = "{full name}";
      preview = "THIS IS A PREVIEW \n";
    }

    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${preview}\*Hey\* ${realName}! It’s time to enter the draw for the next cycle of company lunches.\n\n`
        }
      },
      {
        type: "divider"
      }
    );

    lunchCycle.restaurants.forEach(r => {
      blocks.push(
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${r.emoji} ${r.date}   \<${r.direction}\|${r.name}\>    vegan${r.dietaries.vegan}  vegetarian ${r.dietaries.vegetarian}  meat${r.dietaries.meat}  halal${r.dietaries.halal}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: false,
                text: "Available"
              },
              value: lunchCycle.id + "-" + r.name
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: false,
                text: "Unavailable"
              },
              style: "danger",
              value: lunchCycle.id + "-" + r.name
            }
          ]
        },
        {
          type: "divider"
        }
      );
    });

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown"
      }
    });

    return {
      blocks: blocks
    };
  }
}

module.exports = GenerateLunchersMessage;
