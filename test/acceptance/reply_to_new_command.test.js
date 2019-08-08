const { expect } = require("../test_helper");
const { SendLunchCyclePreview, GenerateSlackMessage } = require("@use_cases");
const { RestaurantFactory } = require("../factories");
const { InMemoryLunchCycleGateway } = require("@gateways");
const { LunchCycle } = require("@domain");

class FakeSlackGateway {
  sendMessage(slackMessage) {
    return true;
  }
}
const restaurantList = [
  RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:" })
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
  let preview="THIS IS A PREVIEW \n"
  let firstName="{first name}"
  var useCase = new GenerateSlackMessage();
  const response = useCase.execute({ lunchCycle, firstName: null });
  message = response.blocks;

  let dates=["12/03/2020", "19/03/2020", "26/03/2020", "02/04/2020", "09/04/2020", "16/04/2020"]
  const expected = [
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `${preview}\*Hey\* ${firstName}! It’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n`
    }
  },
  {
    "type": "divider"
  }];

  restaurantList.forEach((r, i) => {

    expected.push(
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${r.emoji} ${dates[i]}   \<${r.direction}\|${r.name}\>    vegan${r.dietaries.vegan}  vegetarian ${r.dietaries.vegetarian}  meat${r.dietaries.meat}  halal${r.dietaries.halal}`, 
        },
      }, 
      {
        "type": "divider"
      }
    )
  });

  expected.push(
    {
    "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "\:green_heart\: = Great          \:orange_heart\: = Some          \:broken_heart\: = None          \:question\: = Unknown"
  }}
  )
  expect(message).to.be.eql(expected);
}

function ThenALunchCyclePreviewIsSent() {
  var fakeSlackGateway = new FakeSlackGateway();
  var useCase = new SendLunchCyclePreview({ gateway: fakeSlackGateway });
  var response = useCase.execute({ message: message });
  expect(response.isSent).to.be.true;
}
