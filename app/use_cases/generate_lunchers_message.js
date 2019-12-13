const moment = require("moment");

class GenerateLunchersMessage {
  execute({ lunchCycle, realName, available }) {
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
          elements: toggleButtonContent(available[r.name], lunchCycle, r)
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

function toggleButtonContent(available, lunchCycle, restaurant) {
   
  const buttons = [
  {
    type: "button",
    text: {
      type: "plain_text",
      emoji: false,
      text: "Available"
    },
    value: lunchCycle.id + "-" + restaurant.name
  },
  {
    type: "button",
    text: {
      type: "plain_text",
      emoji: false,
      text: "Unavailable"
    },
    value: lunchCycle.id + "-" + restaurant.name
  }
    ]

  if (available === true) {
    buttons[0]['style'] = 'primary'
    return buttons
  } else if (available === false) {
    buttons[1]['style'] = 'danger'
    return buttons
  } else {
    return buttons
  }
}
module.exports = GenerateLunchersMessage;
