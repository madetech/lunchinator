const { expect } = require("../test_helper");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");

const { LunchCycle } = require("@domain");
const { InMemoryLunchCycleGateway } = require("@gateways");
const { IsValidLunchinatorUser, CreateNewLunchCycle, VerifySlackRequest } = require("@use_cases");

let inMemoryLunchCycleGateway;
let slashCommandResponse;
let createNewLunchCycleResponse;

describe("ReceiveNewLunchCycleSlashCommand", async function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
  });

  it("can create a new lunch cycle", async function() {
    GivenANewLunchCycleCommand();
    await WhenANewLunchCycleIsCreatedWith([RestaurantFactory.getRestaurant()], "01-01-2020");
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
    it("where there is not an existing lunch cycle", async function() {
      GivenANewLunchCycleCommandWithInvalidUser();
      await WhenANewLunchCycleIsCreatedWith([RestaurantFactory.getRestaurant()], "01-01-2020");
      ThenANewLunchCycleIsNotCreated();
    });

    it("where there are existing lunch cycles", async function() {
      GivenALunchCycleExists();
      GivenANewLunchCycleCommandWithInvalidUser();
      await WhenANewLunchCycleIsCreatedWith([RestaurantFactory.getRestaurant()], "01-01-2020");
      ThenANewLunchCycleIsNotCreated();
      await ThenTheTotalCountOfLunchCyclesIs(1);
    });
  });

  it("can check that a valid start date has been provided", async function() {
    GivenANewLunchCycleCommand();
    await WhenANewLunchCycleIsCreatedWith([RestaurantFactory.getRestaurant()]);
    ThenANewLunchCycleIsNotCreated();
  });

  it("can check that a list of restaurants has been provided", async function() {
    GivenANewLunchCycleCommand();
    await WhenANewLunchCycleIsCreatedWith([], "01-01-2020");
    ThenANewLunchCycleIsNotCreated();
  });

  describe("can verify the slack request is legit", function() {
    it("can verify a request is legit", function() {
      GivenANewLunchCycleCommand();
      ThenTheSlackRequestIsLegit();
    });

    it("can verify a request is not legit", function() {
      GivenANewLunchCycleCommandWithInvalidSignature();
      ThenTheSlackRequestIsNotLegit();
    });
  });
});

function GivenALunchCycleExists() {
  inMemoryLunchCycleGateway.create(new LunchCycle());
}

function GivenANewLunchCycleCommand() {
  slashCommandResponse = new SlashCommandFactory().getCommand();
}

async function WhenANewLunchCycleIsCreatedWith(restaurants, startsAt) {
  var useCase = new CreateNewLunchCycle({
    lunchCycleGateway: inMemoryLunchCycleGateway,
    isValidLunchinatorUser: new IsValidLunchinatorUser()
  });
  createNewLunchCycleResponse = await useCase.execute({
    userId: slashCommandResponse.body.user_id,
    restaurants: restaurants,
    startsAt: startsAt
  });
}

function ThenANewLunchCycleIsCreated() {
  expect(createNewLunchCycleResponse.lunchCycle).to.not.be.undefined;
}

function ThenTheUserIsValid() {
  var useCase = new IsValidLunchinatorUser();
  var response = useCase.execute({ userId: slashCommandResponse.body.user_id });
  expect(response.isValid).to.be.true;
}

function GivenANewLunchCycleCommandWithInvalidUser() {
  slashCommandResponse = new SlashCommandFactory().getCommand({}, { user_id: "invalid_user" });
}

function ThenTheUserIsNotValid() {
  var useCase = new IsValidLunchinatorUser();
  var response = useCase.execute({ userId: slashCommandResponse.body.user_id });
  expect(response.isValid).to.be.false;
}

function ThenANewLunchCycleIsNotCreated() {
  expect(createNewLunchCycleResponse.lunchCycle).to.be.undefined;
  expect(createNewLunchCycleResponse.error.length).to.be.greaterThan(0);
}

async function ThenTheTotalCountOfLunchCyclesIs(count) {
  expect(count).to.eq(await inMemoryLunchCycleGateway.count());
}

function GivenANewLunchCycleCommandWithInvalidSignature() {
  slashCommandResponse = new SlashCommandFactory().getCommand({
    "x-slack-signature": "invalid_sig"
  });
}

class FakeCryptoGateway {
  areSignaturesEqual(mySignature, theirSignature) {
    return theirSignature === "valid_sig";
  }
}

function ThenTheSlackRequestIsNotLegit() {
  var useCase = new VerifySlackRequest({
    gateway: new FakeCryptoGateway()
  });
  var response = useCase.execute({ slackSignature: "invalid_sig", timestamp: 1, body: {} });
  expect(response.isVerified).to.be.false;
}

function ThenTheSlackRequestIsLegit() {
  var useCase = new VerifySlackRequest({
    gateway: new FakeCryptoGateway()
  });
  var response = useCase.execute({
    slackSignature: "valid_sig",
    timestamp: new Date().getTime() / 1000 - 10,
    body: {}
  });

  expect(response.isVerified).to.be.true;
}
