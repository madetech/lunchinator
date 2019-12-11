const { GenerateLunchersMessage } = require("@use_cases");
const { expect } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");

const restaurantList = [
  RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:", date: "12/03/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:", date: "19/03/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:", date: "26/03/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:", date: "02/04/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:", date: "09/04/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:", date: "16/04/2020" })
];

function expectedRestaurantBlocks(restaurant, lunchCycle) {
  expectedBlocks = [];
  restaurant.forEach(r => {
    expectedBlocks.push(
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
  return expectedBlocks;
}

describe("GenerateLunchersMessage", function() {
  const lunchCycle = new LunchCycle({
    id: 10,
    restaurants: restaurantList,
    starts_at: new Date("2020-03-12T00:00:00")
  });

  it("can generate a lunch cycle message with a first name", function() {
    const slackRealName = "Barry Smith";
    const useCase = new GenerateLunchersMessage();
    const response = useCase.execute({ lunchCycle: lunchCycle, realName: slackRealName });

    let expected = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\*Hey\* ${slackRealName}! It’s time to enter the draw for the next cycle of company lunches.\n\n`
        }
      },
      {
        type: "divider"
      }
    ];

    expected = expected.concat(expectedRestaurantBlocks(restaurantList, lunchCycle));

    expected.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown"
      }
    });

    expect(response.blocks).to.be.eql(expected);
  });

  it("can generate a lunch cycle message without a first name", function() {
    const noFirstName = null;
    const preview = "THIS IS A PREVIEW \n";
    const useCase = new GenerateLunchersMessage();
    const response = useCase.execute({ lunchCycle: lunchCycle, firstName: noFirstName });

    let expected = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${preview}\*Hey\* {full name}! It’s time to enter the draw for the next cycle of company lunches.\n\n`
        }
      },
      {
        type: "divider"
      }
    ];

    expected = expected.concat(expectedRestaurantBlocks(restaurantList, lunchCycle));

    expected.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown"
      }
    });

    expect(response.blocks).to.be.eql(expected);
  });
});
