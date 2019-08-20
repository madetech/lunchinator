const { expect, sinon } = require("../test_helper");
const { RestaurantFactory, GoogleSheetRowFactory } = require("../factories");
const { InMemoryLunchCycleGateway, SlackGateway } = require("@gateways");
const { FakeSlackClient } = require("../fakes");
const config = require("@app/config");

const { LunchCycle } = require("@domain");
const {
  GetNewLunchCycleRestaurants,
  FetchRestaurantsFromGoogleSheet,
  FetchAllSlackUsers
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
let fakeSlackClient;
let slackGateway;

describe("Acceptance Test for Fetching Restaurants", function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
    fakeSlackClient = new FakeSlackClient({ token: "NOT_VALID" });
    SlackGateway.prototype._slackClient = () => fakeSlackClient;
    userList = [
      {
        id: "USLACKID1",
        team_id: "TEAM_ID",
        name: "Test Name",
        deleted: false,
        profile: {
          email: "test2@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1520258399
      },
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      },
      {
        id: "USLACKID3",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160375
      },
      {
        id: "USLACKID4",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160377
      }
    ];
    fakeSlackClient.stubUserList(userList);

    slackGateway = new SlackGateway();
  });

  it("can fetch the restaurants from the google sheet", async function() {
    await WhenTheRestaurantsAreFetchedFromTheGoogleSheet();
    ThenTheRestaurantListWillBe(restaurantList);
  });

  it("can get the restaurants for the new lunch cycle", async function() {
    await WhenWeGetTheLunchCycleRestaurants();
    await GivenANewLunchCycleHasBeenCreated();
    ThenTheNewLunchCycleRestaurantsWillBe(restaurantList.slice(0, 2));
  });

  describe("when there is a previous lunch cycle with restaurants", function() {
    it("can get the restaurants for the new lunch cycle", async function() {
      GivenALunchCycleExistsWithRestaurants(restaurantList.slice(0, 6));
      await WhenWeGetTheLunchCycleRestaurants();
      await GivenANewLunchCycleHasBeenCreated();

      ThenTheNewLunchCycleRestaurantsWillBe(restaurantList.slice(6));
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

function GivenALunchCycleExistsWithRestaurants(restaurants) {
  inMemoryLunchCycleGateway.create(new LunchCycle({ restaurants: restaurants }));
}

async function WhenTheRestaurantsAreFetchedFromTheGoogleSheet() {
  const useCase = new FetchRestaurantsFromGoogleSheet({
    googleSheetGateway: { fetchRows: sinon.fake.returns(rawGoogleSheetRestaurantList) }
  });
  fetchRestaurantsFromGoogleSheetResponse = await useCase.execute();
}

function ThenTheRestaurantListWillBe(expected) {
  expect(fetchRestaurantsFromGoogleSheetResponse.restaurants.map(r => r.name)).to.eql(
    expected.map(r => r.name)
  );
}

async function WhenWeGetTheLunchCycleRestaurants() {
  sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 2);
  const useCase = new GetNewLunchCycleRestaurants({
    fetchRestaurantsFromGoogleSheet: new FetchRestaurantsFromGoogleSheet({
      googleSheetGateway: { fetchRows: sinon.fake.returns(rawGoogleSheetRestaurantList) }
    }),
    fetchAllSlackUsers: new FetchAllSlackUsers({
      slackGateway: slackGateway
    })
  });

  const currentLunchCycle = await inMemoryLunchCycleGateway.getCurrent();

  getNewLunchCycleRestaurantsResponse = await useCase.execute({
    currentLunchCycle
  });
}

function ThenTheNewLunchCycleRestaurantsWillBe(expected) {
  expect(getNewLunchCycleRestaurantsResponse.restaurants.map(r => r.name)).to.eql(
    expected.map(r => r.name)
  );
}
