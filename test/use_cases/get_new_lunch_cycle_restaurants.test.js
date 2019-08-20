const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { GetNewLunchCycleRestaurants } = require("@use_cases");
const config = require("@app/config");

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
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 8);

    const fetchRestaurantsFromGoogleSheetStub = {
      execute: sinon.fake.returns({ restaurants })
    };

    const currentLunchCycle = { restaurants: restaurants.slice(0, 6) };

    const response = await new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: fetchRestaurantsFromGoogleSheetStub,
      fetchAllSlackUsers: {
        execute: sinon.fake.resolves({
          slackUsers: Array(48).fill({})
        })
      }
    }).execute({ currentLunchCycle });

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
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 8);

    const fetchRestaurantsFromGoogleSheetStub = {
      execute: sinon.fake.returns({ restaurants })
    };

    const response = await new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: fetchRestaurantsFromGoogleSheetStub,
      fetchAllSlackUsers: { execute: sinon.fake.resolves({ slackUsers: Array(48).fill({}) }) }
    }).execute({
      currentLunchCycle: null
    });

    expect(response.restaurants).to.eql([
      restaurants[0],
      restaurants[1],
      restaurants[2],
      restaurants[3],
      restaurants[4],
      restaurants[5]
    ]);
  });

  it("can generate the correct number of lunchCyles per restaurant", async function() {
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 2);

    const response = await new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: {
        execute: sinon.fake.resolves({ restaurants: restaurants })
      },
      fetchAllSlackUsers: {
        execute: sinon.fake.resolves({
          slackUsers: [
            { user1: "" },
            { user2: "" },
            { user3: "" },
            { user4: "" },
            { user5: "" },
            { user6: "" }
          ]
        })
      }
    }).execute({
      currentLunchCycle: null
    });
    expect(response.restaurants.length).to.eql(3);
  });
});
