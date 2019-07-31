const { GenerateSlackMessage } = require("@use_cases");
const { expect } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");

const restaurantList = [
  RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:" })
];

describe("GenerateSlackMessage", function() {
  const lunchCycle = new LunchCycle({
    restaurants: restaurantList,
    starts_at: new Date("2020-03-12T00:00:00")
  });

  const direction = "googlemaps";
  const expected = [
    `:bowtie: 12/03/2020 restaurant1 vegan:2, meat:2, direction:${direction}`,
    `:smile: 19/03/2020 restaurant2 vegan:2, meat:2, direction:${direction}`,
    `:simple_smile: 26/03/2020 restaurant3 vegan:2, meat:2, direction:${direction}`,
    `:laughing: 02/04/2020 restaurant4 vegan:2, meat:2, direction:${direction}`,
    `:blush: 09/04/2020 restaurant5 vegan:2, meat:2, direction:${direction}`,
    `:relaxed: 16/04/2020 restaurant6 vegan:2, meat:2, direction:${direction}\n`
  ];

  it("can generate a lunch cycle message with a first name", function() {
    const slackFirstName = "Barry";
    const useCase = new GenerateSlackMessage({ firstName: slackFirstName });
    const response = useCase.execute({ lunchCycle: lunchCycle });

    const expectedMessage =
      `Hey ${slackFirstName} it’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n` +
      expected.join("\n");

    expect(response.message).to.be.eql(expectedMessage);
  });

  it("can generate a lunch cycle message without a first name", function() {
    const noFirstName = "";
    const useCase = new GenerateSlackMessage({ firstName: noFirstName });
    const response = useCase.execute({ lunchCycle: lunchCycle });

    const expectedMessage =
      `Hey {first name}! it’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n` +
      expected.join("\n");

    expect(response.message).to.be.eql(expectedMessage);
  });
});
