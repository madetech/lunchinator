const { RestaurantFactory, slackButtonPayloadFactory } = require("../factories");
const { expect, clearPostgres } = require("../test_helper");
const { LunchCycle, Luncher } = require("@domain");
const config = require("@app/config");
const { PostgresLuncherAvailabilityGateway, PostgresLunchCycleGateway } = require("@gateways");
const { ProcessLuncherResponse } = require("@use_cases");

let createdLunchCycle;
describe("When a user presses an interactive button", async function() {

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
      await WhenSentAButtonResponseOf(restaurant1);
      await ThenALuncherIsAvailableFor([restaurant1]);
    });

    it("saves many restaurants", async function() {
      await WhenSentAButtonResponseOf(restaurant1);
      await WhenSentAButtonResponseOf(restaurant2);

      await ThenALuncherIsAvailableFor([restaurant1, restaurant2]);
    });

    it("responding many times to the same restaurant has no effect", async function() {
      await WhenSentAButtonResponseOf(restaurant2);

      await WhenSentAButtonResponseOf(restaurant1);
      await WhenSentAButtonResponseOf(restaurant1);

      await ThenALuncherIsAvailableFor([restaurant1, restaurant2]);
    });
  });

  async function WhenSentAButtonResponseOf(restaurant) {
    const usecase = new ProcessLuncherResponse({
      luncherAvailabilityGateway: availabiltyGateway,
      lunchCycleDrawGateway: new PostgresLunchCycleGateway()
    });
    const request = slackButtonPayloadFactory("DJWDYWUD124", restaurant.name, createdLunchCycle.id)
    await usecase.execute({
      payload: request
    });
  }

  async function ThenALuncherIsAvailableFor(restaurant_array) {
    const expectedRestauntNames = restaurant_array.map((r) => r.name)

    const allUsersAvailable = await availabiltyGateway.getAvailabilities({
      lunch_cycle_id: createdLunchCycle.id
    });
    expect(allUsersAvailable.length).to.eql(expectedRestauntNames.length);

    const actualRestaurantNames = allUsersAvailable.map((availability) => availability.restaurant_name)
    expect(actualRestaurantNames).to.eql(expectedRestauntNames);
  }
});
