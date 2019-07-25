const { expect } = require("../test_helper");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");

const { LunchCycle, DietaryLevel } = require("@domain");
const { InMemoryLunchCycleGateway } = require("@gateways");
const {
  IsValidLunchinatorUser,
  CreateNewLunchCycle,
  SendLunchCyclePreview,
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet
} = require("@use_cases");

class FakeSlackGateway {
  sendMessage(slackMessage) {
    return true;
  }
}

class FakeInMemoryRestaurantsGateway {
  constructor() {
    this.restaurants = [
      RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:" }),
      RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:" }),
      RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:" }),
      RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:" }),
      RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:" }),
      RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:" }),
      RestaurantFactory.getRestaurant({ name: "restaurant7", emoji: ":smirk:" }),
      RestaurantFactory.getRestaurant({ name: "restaurant8", emoji: ":heart_eyes:" })
    ];
  }

  all() {
    return this.restaurants;
  }
}

let inMemoryLunchCycleGateway;
let fakeRestaurantsGateway;
let slashCommandParams;
let createNewLunchCycleResponse;
let getNewLunchCycleRestaurantsResponse;
let fetchRestaurantsFromGoogleSheetResponse;

describe("ReceiveNewLunchCycleSlashCommand", function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
    fakeRestaurantsGateway = new FakeInMemoryRestaurantsGateway();
  });

  it("can create a new lunch cycle", function() {
    GivenANewLunchCycleCommand();
    WhenANewLunchCycleIsCreated();
    ThenANewLunchCycleIsCreated();
  });

  it("can check for a valid user", function() {
    GivenANewLunchCycleCommand();
    ThenTheUserIsValid();
  });

  it("can check for an invalid user", function() {
    GivenANewLunchCycleCommandWithInvalidUser();
    ThenTheUserIsNotValid();
  });

  describe("cannot create a new lunch cycle when the user is not valid", function() {
    it("where there is not an existing lunch cycle", function() {
      GivenANewLunchCycleCommandWithInvalidUser();
      WhenANewLunchCycleIsCreated();
      ThenANewLunchCycleIsNotCreated();
    });

    it("where there are existing lunch cycles", function() {
      GivenALunchCycleExists();
      GivenANewLunchCycleCommandWithInvalidUser();
      WhenANewLunchCycleIsCreated();
      ThenANewLunchCycleIsNotCreated();
      ThenTheTotalCountOfLunchCyclesIs(1);
    });
  });

  it("can get the restaurants for the new lunch cycle", function() {
    GivenANewLunchCycleCommand();
    WhenANewLunchCycleIsCreated();
    WhenWeGetTheLunchCycleRestaurants();
    ThenTheNewLunchCycleRestaurantsWillBe(fakeRestaurantsGateway.all().slice(0, 6));
  });

  describe("when there is a previous lunch cycle with restaurants", function() {
    it("can get the restaurants for the new lunch cycle", function() {
      GivenALunchCycleExistsWithRestaurants(fakeRestaurantsGateway.all().slice(0, 6));
      GivenANewLunchCycleCommand();
      WhenANewLunchCycleIsCreated();
      WhenWeGetTheLunchCycleRestaurants();
      ThenTheNewLunchCycleRestaurantsWillBe(
        fakeRestaurantsGateway
          .all()
          .slice(6, 8)
          .concat(fakeRestaurantsGateway.all().slice(0, 4))
      );
    });
  });

  it("can fetch the restaurants from the google sheet", function() {
    GivenANewLunchCycleCommand();
    WhenANewLunchCycleIsCreated();
    WhenTheRestaurantsAreFetchedFromTheGoogleSheet();
    ThenTheRestaurantListWillBe([
      RestaurantFactory.getRestaurant({
        dietaries: {
          halal: DietaryLevel.Unknown,
          meat: DietaryLevel.Great,
          vegan: DietaryLevel.Some,
          vegetarian: DietaryLevel.Some
        },
        emoji: ":blush:",
        name: "Nandos",
        notes: ""
      })
    ]);
  });

  it("can send a preview message", function() {
    GivenANewLunchCycleCommand();
    WhenANewLunchCycleIsCreated();
    ThenALunchCyclePreviewIsSent();
  });
});

function GivenALunchCycleExistsWithRestaurants(restaurants) {
  inMemoryLunchCycleGateway.create(new LunchCycle({ restaurants: restaurants }));
}

function WhenWeGetTheLunchCycleRestaurants() {
  var useCase = new GetNewLunchCycleRestaurants({
    restaurantsGateway: fakeRestaurantsGateway,
    getPreviousLunchCycle: new GetPreviousLunchCycle({
      lunchCycleGateway: inMemoryLunchCycleGateway
    })
  });

  var lastRestaurantInLastLunchCycle = inMemoryLunchCycleGateway.all().slice(-1)[0];
  getNewLunchCycleRestaurantsResponse = useCase.execute(lastRestaurantInLastLunchCycle);
}

function ThenTheNewLunchCycleRestaurantsWillBe(expected) {
  expect(getNewLunchCycleRestaurantsResponse.restaurants).to.eql(expected);
}

function GivenALunchCycleExists() {
  inMemoryLunchCycleGateway.create(new LunchCycle());
}

function GivenANewLunchCycleCommand() {
  slashCommandParams = new SlashCommandFactory().getCommand();
}

function WhenANewLunchCycleIsCreated() {
  var useCase = new CreateNewLunchCycle({
    lunchCycleGateway: inMemoryLunchCycleGateway,
    isValidLunchinatorUser: new IsValidLunchinatorUser()
  });
  createNewLunchCycleResponse = useCase.execute({ userId: slashCommandParams.user_id });
}

function ThenANewLunchCycleIsCreated() {
  expect(createNewLunchCycleResponse.lunchCycle).to.not.be.null;
}

function ThenTheUserIsValid() {
  var useCase = new IsValidLunchinatorUser();
  var response = useCase.execute({ userId: slashCommandParams.user_id });
  expect(response.isValid).to.be.true;
}

function GivenANewLunchCycleCommandWithInvalidUser() {
  slashCommandParams = new SlashCommandFactory().getCommand({
    user_id: "invalid_user"
  });
}

function ThenTheUserIsNotValid() {
  var useCase = new IsValidLunchinatorUser();
  var response = useCase.execute({ userId: slashCommandParams.user_id });
  expect(response.isValid).to.be.false;
}

function ThenANewLunchCycleIsNotCreated() {
  expect(createNewLunchCycleResponse.lunchCycle).to.be.null;
}

function ThenALunchCyclePreviewIsSent() {
  var fakeSlackGateway = new FakeSlackGateway();
  var useCase = new SendLunchCyclePreview({ gateway: fakeSlackGateway });
  var response = useCase.execute();
  expect(response.slackResponse).to.be.true;
}

function ThenTheTotalCountOfLunchCyclesIs(count) {
  expect(count).to.eq(inMemoryLunchCycleGateway.count());
}

class FakeGoogleSheetGateway {
  fetchRows(sheetId) {
    return [
      {
        _links: [],
        _xml: "",
        del: () => {},
        emoji: ":blush:",
        halal: "?",
        id: "sheet_url",
        meat: "great",
        notes: "",
        restaurant: "Nandos",
        save: () => {},
        vegan: "some",
        vegetarian: "some"
      }
    ];
  }
}

function WhenTheRestaurantsAreFetchedFromTheGoogleSheet() {
  const fakeGoogleSheetGateway = new FakeGoogleSheetGateway();
  const useCase = new FetchRestaurantsFromGoogleSheet({
    googleSheetGateway: fakeGoogleSheetGateway
  });
  fetchRestaurantsFromGoogleSheetResponse = useCase.execute();
}

function ThenTheRestaurantListWillBe(expected) {
  expect(fetchRestaurantsFromGoogleSheetResponse.restaurants).to.eql(expected);
}
