const moment = require("moment");

class GenerateLunchersMessage {
  execute({ lunchCycle, firstName }) {
    const blocks = [];
    let preview = "";
    if (!firstName) {
      firstName = "{first name}";
      preview = "THIS IS A PREVIEW \n";
    }

    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${preview}\*Hey\* ${firstName}! It’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n`
        }
      },
      {
        type: "divider"
      }
    );

    lunchCycle.restaurants.forEach(r => {
      console.log('creating restarunt blocks')
      blocks.push(
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${r.emoji} ${r.date}   \<${r.direction}\|${r.name}\>    vegan${r.dietaries.vegan}  vegetarian ${r.dietaries.vegetarian}  meat${r.dietaries.meat}  halal${r.dietaries.halal}`
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Interested"
              },
              style: "primary",
              value: "click_me_123"
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Not Interested"
              },
              style: "danger",
              value: "click_me_123"
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
