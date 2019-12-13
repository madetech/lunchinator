const { expect } = require("../test_helper");
const { SendLunchCyclePreview, GenerateLunchersMessage } = require("@use_cases");
const { RestaurantFactory } = require("../factories");
const { InMemoryLunchCycleGateway } = require("@gateways");
const { LunchCycle } = require("@domain");

class FakeSlackGateway {
  sendMessageWithBlocks(slackMessage) {
    return true;
  }
}
const restaurantList = [
  RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:", date: "12/03/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:", date: "19/03/2020" }),
  RestaurantFactory.getRestaurant({
    name: "restaurant3",
    emoji: ":simple_smile:",
    date: "26/03/2020"
  }),
  RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:", date: "02/04/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:", date: "09/04/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:", date: "16/04/2020" })
];

let inMemoryLunchCycleGateway;

describe("Acceptance Test can reply to new lunch cycle slash command", function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
  });
  it("can send a create a lunch cycle preview message and send it", function() {
    GivenALunchCycleWithRestaurantsExists(restaurantList);
    ThenANewLunchCyclePreviewMessageIsCreated();
    ThenALunchCyclePreviewIsSent();
  });
});

let lunchCycle;
let message;

function GivenALunchCycleWithRestaurantsExists(restaurants) {
  lunchCycle = new LunchCycle({
    restaurants: restaurantList,
    starts_at: new Date("2020-03-12T00:00:00")
  });

  inMemoryLunchCycleGateway.create(lunchCycle);
}

function ThenANewLunchCyclePreviewMessageIsCreated() {
  let preview = "THIS IS A PREVIEW \n";
  let firstName = "{full name}";
  var useCase = new GenerateLunchersMessage();
  const response = useCase.execute({ lunchCycle, firstName: null, available: {} });
  message = response.blocks;

  const expected = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${preview}\*Hey\* ${firstName}! It’s time to enter the draw for the next cycle of company lunches.\n\n`
      }
    },
    {
      type: "divider"
    }
  ];

  restaurantList.forEach(r => {
    expected.push(
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
            // style: "danger",
            value: lunchCycle.id + "-" + r.name
          }
        ]
      },
      {
        type: "divider"
      }
    );
  });

  expected.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        ":green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown"
    }
  });
  expect(message).to.be.eql(expected);
}

function ThenALunchCyclePreviewIsSent() {
  var fakeSlackGateway = new FakeSlackGateway();
  var useCase = new SendLunchCyclePreview({ gateway: fakeSlackGateway });
  var response = useCase.execute({ message: message });
  expect(response.isSent).to.be.true;
}
