const { expect } = require("../test_helper");
const { RestaurantFactory, GoogleSheetRowFactory } = require("../factories");
const { InMemoryLunchCycleGateway } = require("@gateways");
const { LunchCycle } = require("@domain");
const {
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet
} = require("@use_cases");

const restaurantList = [
  RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant7", emoji: ":smirk:" }),
  RestaurantFactory.getRestaurant({ name: "restaurant8", emoji: ":heart_eyes:" })
];

const rawGoogleSheetRestaurantList = [
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant1", emoji: ":bowtie:" }),
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant2", emoji: ":smile:" }),
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant3", emoji: ":simple_smile:" }),
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant4", emoji: ":laughing:" }),
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant5", emoji: ":blush:" }),
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant6", emoji: ":relaxed:" }),
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant7", emoji: ":smirk:" }),
  GoogleSheetRowFactory.getRestaurantRow({ restaurant: "restaurant8", emoji: ":heart_eyes:" })
];

let fetchRestaurantsFromGoogleSheetResponse;
let inMemoryLunchCycleGateway;
let getNewLunchCycleRestaurantsResponse;

describe("Acceptance Test for Fetching Restaurants", async function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
  });

  it("can fetch the restaurants from the google sheet", async function() {
    await WhenTheRestaurantsAreFetchedFromTheGoogleSheet();
    ThenTheRestaurantListWillBe(restaurantList);
  });

  it("can get the restaurants for the new lunch cycle", async function() {
    await WhenWeGetTheLunchCycleRestaurants();
    await GivenANewLunchCycleHasBeenCreated();
    ThenTheNewLunchCycleRestaurantsWillBe(restaurantList.slice(0, 6));
  });

  describe("when there is a previous lunch cycle with restaurants", async function() {
    it("can get the restaurants for the new lunch cycle", async function() {
      GivenALunchCycleExistsWithRestaurants(restaurantList.slice(0, 6));
      await WhenWeGetTheLunchCycleRestaurants();
      await GivenANewLunchCycleHasBeenCreated();

      ThenTheNewLunchCycleRestaurantsWillBe(
        restaurantList.slice(6, 8).concat(restaurantList.slice(0, 4))
      );
    });
  });
});

async function GivenANewLunchCycleHasBeenCreated() {
  const options = {};
  if (getNewLunchCycleRestaurantsResponse) {
    options.restaurants = getNewLunchCycleRestaurantsResponse.restaurants;
  }
  await inMemoryLunchCycleGateway.create(new LunchCycle(options));
}

class FakeGoogleSheetGateway {
  fetchRows(sheetId) {
    return rawGoogleSheetRestaurantList;
  }
}

function GivenALunchCycleExistsWithRestaurants(restaurants) {
  inMemoryLunchCycleGateway.create(new LunchCycle({ restaurants: restaurants }));
}

async function WhenTheRestaurantsAreFetchedFromTheGoogleSheet() {
  const fakeGoogleSheetGateway = new FakeGoogleSheetGateway();
  const useCase = new FetchRestaurantsFromGoogleSheet({
    googleSheetGateway: fakeGoogleSheetGateway
  });
  fetchRestaurantsFromGoogleSheetResponse = await useCase.execute();
}

function ThenTheRestaurantListWillBe(expected) {
  expect(fetchRestaurantsFromGoogleSheetResponse.restaurants).to.eql(expected);
}

async function WhenWeGetTheLunchCycleRestaurants() {
  const useCase = new GetNewLunchCycleRestaurants({
    fetchRestaurantsFromGoogleSheet: new FetchRestaurantsFromGoogleSheet({
      googleSheetGateway: new FakeGoogleSheetGateway()
    }),
    getPreviousLunchCycle: new GetPreviousLunchCycle({
      lunchCycleGateway: inMemoryLunchCycleGateway
    })
  });

  getNewLunchCycleRestaurantsResponse = await useCase.execute();
}

function ThenTheNewLunchCycleRestaurantsWillBe(expected) {
  expect(getNewLunchCycleRestaurantsResponse.restaurants).to.eql(expected);
}
