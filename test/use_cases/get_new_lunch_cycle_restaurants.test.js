const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { GetNewLunchCycleRestaurants } = require("@use_cases");

describe("GetNewLunchCycleRestaurants", function() {
  const restaurants = [
    RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:" }),
    RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:" }),
    RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:" }),
    RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:" }),
    RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:" }),
    RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:" }),
    RestaurantFactory.getRestaurant({ name: "restaurant7", emoji: ":smirk:" }),
    RestaurantFactory.getRestaurant({ name: "restaurant8", emoji: ":heart_eyes:" })
  ];

  it("uses the previous lunch cycle's restaurants", async function() {
    const fetchRestaurantsFromGoogleSheetStub = {
      execute: sinon.fake.returns({ restaurants })
    };
    const getPreviousLunchFake = {
      execute: sinon.fake.returns({
        previousLunchCycle: {
          restaurants: restaurants.slice(0, 6)
        }
      })
    };

    const response = await new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: fetchRestaurantsFromGoogleSheetStub,
      getPreviousLunchCycle: getPreviousLunchFake
    }).execute();

    expect(response.restaurants).to.eql([
      restaurants[6],
      restaurants[7],
      restaurants[0],
      restaurants[1],
      restaurants[2],
      restaurants[3]
    ]);
  });

  it("can handle no previous lunch cycle", async function() {
    const fetchRestaurantsFromGoogleSheetStub = {
      execute: sinon.fake.returns({ restaurants })
    };
    const getPreviousLunchFake = {
      execute: sinon.fake.returns({ previousLunchCycle: null })
    };

    const response = await new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: fetchRestaurantsFromGoogleSheetStub,
      getPreviousLunchCycle: getPreviousLunchFake
    }).execute();

    expect(response.restaurants).to.eql([
      restaurants[0],
      restaurants[1],
      restaurants[2],
      restaurants[3],
      restaurants[4],
      restaurants[5]
    ]);
  });
});
