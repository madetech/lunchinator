const { expect } = require("../test_helper");
const SlashCommandFactory = require("./slash_command_factory");
const LunchCycle = require("@domain/lunch_cycle");
const IsValidLunchinatorUser = require("@use_cases/is_valid_lunchinator_user");
const CreateNewLunchCycle = require("@use_cases/create_new_lunch_cycle");
const SendLunchCyclePreview = require("@use_cases/send_lunch_cycle_preview");
const GetNewLunchCycleRestaurants = require("@use_cases/get_new_lunch_cycle_restaurants");
const GetPreviousLunchCycle = require("@use_cases/get_previous_lunch_cycle");
const Dietary = require("@domain/dietary");

class FakeInMemoryLunchCycleGateway {
  constructor() {
    this.lunchCycles = [];
  }

  create(lunchCycle) {
    this.lunchCycles.push(lunchCycle);
    return lunchCycle;
  }

  count() {
    return this.lunchCycles.length;
  }
}

class FakeSlackGateway {
  sendMessage(slackMessage) {
    return true;
  }
}

class FakeInMemoryRestaurantsGateway {}

let fakeLunchCycleGateway;
let fakeRestaurantsGateway;
let slashCommandParams;
let createNewLunchCycleResponse;
let getNewLunchCycleRestaurantsResponse;

describe("ReceiveNewLunchCycleSlashCommand", function() {
  beforeEach(function() {
    fakeLunchCycleGateway = new FakeInMemoryLunchCycleGateway();
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
    WhenWeGetTheRestaurants();
    ThenTheRestaurantsWillBe([
      { name: "restaurant1", dietaries: [Dietary.Vegan, Dietary.Meat] },
      { name: "restaurant2", dietaries: [Dietary.Meat] }
    ]);
  });

  it("can send a preview message", function() {
    GivenANewLunchCycleCommand();
    WhenANewLunchCycleIsCreated();
    ThenALunchCyclePreviewIsSent();
  });
});

function WhenWeGetTheRestaurants() {
  var useCase = new GetNewLunchCycleRestaurants({
    restaurantsGateway: fakeRestaurantsGateway,
    getPreviousLunchCycle: new GetPreviousLunchCycle({ lunchCycleGateway: fakeLunchCycleGateway })
  });
  getNewLunchCycleRestaurantsResponse = useCase.execute();
}

function ThenTheRestaurantsWillBe(expected) {
  expect(getNewLunchCycleRestaurantsResponse.restaurants).to.eql(expected);
}

function GivenALunchCycleExists() {
  fakeLunchCycleGateway.create(new LunchCycle());
}

function GivenANewLunchCycleCommand() {
  slashCommandParams = new SlashCommandFactory().getCommand();
}

function WhenANewLunchCycleIsCreated() {
  var useCase = new CreateNewLunchCycle({
    lunchCycleGateway: fakeLunchCycleGateway,
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
  expect(count).to.eq(fakeLunchCycleGateway.count());
}
