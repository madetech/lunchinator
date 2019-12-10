const { RestaurantFactory, slackButtonPayloadFactory } = require("../factories");
const { expect, clearPostgres } = require("../test_helper");
const { LunchCycle, Luncher } = require("@domain");
const config = require("@app/config");
const { PostgresLuncherAvailabilityGateway, PostgresLunchCycleGateway } = require("@gateways");
const { ProcessLuncherResponse } = require("@use_cases");

let createdLunchCycle;
describe("When a user presses an interactive button", function() {
  const availabiltyGateway = new PostgresLuncherAvailabilityGateway(config.db);
  const restaurant1 = RestaurantFactory.getRestaurant({
    name: "Restaurant-1"
  });
  const restaurant2 = RestaurantFactory.getRestaurant({
    name: "Restaurant-2"
  });
  const restaurant3 = RestaurantFactory.getRestaurant({
    name: "Restaurant-3"
  });
  const restaurant4 = RestaurantFactory.getRestaurant({
    name: "Restaurant-4"
  });

  const restaurantsArray = [restaurant1, restaurant2, restaurant3, restaurant4];
  const lunchCycle = new LunchCycle({
    restaurants: restaurantsArray
  });

  beforeEach(async function() {
    await clearPostgres();
    createdLunchCycle = await new PostgresLunchCycleGateway().create(lunchCycle);
  });

  describe("to signal they are available", function() {
    it("no user response", async function() {
      // when no response set
      await ThenALuncherIsAvailableFor([]);
    });

    it("saves the user response", async function() {
      // when no response set
      await WhenSentAButtonResponseOf(restaurant1, true);
      await ThenALuncherIsAvailableFor([restaurant1]);
    });

    it("saves many restaurants", async function() {
      await WhenSentAButtonResponseOf(restaurant1, true);
      await WhenSentAButtonResponseOf(restaurant2, true);

      await ThenALuncherIsAvailableFor([restaurant1, restaurant2]);
    });

    it("responding many times to the same restaurant has no effect", async function() {
      await WhenSentAButtonResponseOf(restaurant2, true);

      await WhenSentAButtonResponseOf(restaurant1, true);
      await WhenSentAButtonResponseOf(restaurant1, true);

      await ThenALuncherIsAvailableFor([restaurant1, restaurant2]);
    });

    it("Records user unavailability button ", async function() {
      await WhenSentAButtonResponseOf(restaurant1, false);
      await ThenALuncherIsAvailableFor([restaurant1]);
      await ThenPayloadHasButtonCalled("Unavailable");
    });

    it("Records user availability button ", async function() {
      await WhenSentAButtonResponseOf(restaurant1, true);
      await ThenALuncherIsAvailableFor([restaurant1]);
      await ThenPayloadHasButtonCalled("Available");
    });
    
  });

  async function WhenSentAButtonResponseOf(restaurant, available) {
    const usecase = new ProcessLuncherResponse({
      luncherAvailabilityGateway: availabiltyGateway,
      lunchCycleDrawGateway: new PostgresLunchCycleGateway()
    });
    let buttonName;
    if (available == true) {
      buttonName = "Available";
    } else {
      buttonName = "Unavailable";
    }

    const request = slackButtonPayloadFactory(
      "DJWDYWUD124",
      restaurant.name,
      createdLunchCycle.id,
      buttonName
    );
    await usecase.execute(request);
  }

  async function ThenPayloadHasButtonCalled(buttonName) {
    const request = slackButtonPayloadFactory(
      "DJWDYWUD124",
      "LeBlank",
      createdLunchCycle.id,
      buttonName
    );

    expect(request.actions[0].text.text).to.eq(buttonName);
  }

  async function ThenALuncherIsAvailableFor(restaurant_array) {
    const expectedRestaurantNames = restaurant_array.map(r => r.name);

    const allUsersAvailable = await availabiltyGateway.getAvailabilities({
      // All who have responded Available or Unavailable
      lunch_cycle_id: createdLunchCycle.id
    });
    expect(allUsersAvailable.length).to.eql(expectedRestaurantNames.length);

    const actualRestaurantNames = allUsersAvailable.map(
      availability => availability.restaurant_name
    );
    expect(actualRestaurantNames).to.have.members(expectedRestaurantNames);
  }
});
