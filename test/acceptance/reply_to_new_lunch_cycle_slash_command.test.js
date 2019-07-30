const { expect } = require("../test_helper");
const { SendLunchCyclePreview, GenerateSlackPreviewMessage } = require("@use_cases");
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
  var useCase = new GenerateSlackPreviewMessage();
  const response = useCase.execute({ lunchCycle });
  message = response.message;

  const expected = [
    ":bowtie: 12/3/2020 restaurant1 vegan:2, meat:2, direction:googlemaps",
    ":smile: 19/3/2020 restaurant2 vegan:2, meat:2, direction:googlemaps",
    ":simple_smile: 26/3/2020 restaurant3 vegan:2, meat:2, direction:googlemaps",
    ":laughing: 2/4/2020 restaurant4 vegan:2, meat:2, direction:googlemaps",
    ":blush: 9/4/2020 restaurant5 vegan:2, meat:2, direction:googlemaps",
    ":relaxed: 16/4/2020 restaurant6 vegan:2, meat:2, direction:googlemaps\n"
  ];

  const expectedMessage =
    "Hey {first name}! It’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n" +
    expected.join("\n");
  expect(message).to.be.eql(expectedMessage);
}

function ThenALunchCyclePreviewIsSent() {
  var fakeSlackGateway = new FakeSlackGateway();
  var useCase = new SendLunchCyclePreview({ gateway: fakeSlackGateway });
  var response = useCase.execute({ message: message });
  expect(response.isSent).to.be.true;
}
