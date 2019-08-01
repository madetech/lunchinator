const { expect } = require("../test_helper");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");

const { LunchCycle } = require("@domain");
const { InMemoryLunchCycleGateway } = require("@gateways");
const { CreateNewLunchCycle, VerifySlackRequest, IsLunchinatorAdmin } = require("@use_cases");

let inMemoryLunchCycleGateway;
let slashCommandResponse;
let createNewLunchCycleResponse;

describe("ReceiveNewLunchCycleSlashCommand", function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
    slashCommandResponse = undefined;
    createNewLunchCycleResponse = undefined;
  });

  it("can create a new lunch cycle", async function() {
    GivenANewLunchCycleCommand();
    await WhenANewLunchCycleIsCreatedWith(
      [RestaurantFactory.getRestaurant()],
      "2020-01-01T00:00:00+01:00"
    );
    ThenANewLunchCycleIsCreated();
  });

  it("can create a second lunch cycle", async function() {
    GivenALunchCycleExists();
    GivenANewLunchCycleCommand();
    await WhenANewLunchCycleIsCreatedWith(
      [RestaurantFactory.getRestaurant()],
      "2020-01-01T00:00:00+01:00"
    );
    ThenANewLunchCycleIsCreated();
    await ThenTheTotalCountOfLunchCyclesIs(2);
  });

  describe("user validation", function() {
    it("can check for a valid user", function() {
      GivenANewLunchCycleCommand();
      ThenTheUserIsValid();
    });

    it("can check for an invalid user", function() {
      GivenANewLunchCycleCommandWithInvalidUser();
      ThenTheUserIsNotValid();
    });
  });

  describe("date validation", function() {
    it("can check that a valid start date has been provided", async function() {
      GivenANewLunchCycleCommand();
      await WhenANewLunchCycleIsCreatedWith([RestaurantFactory.getRestaurant()]);
      ThenANewLunchCycleIsNotCreated();
    });
  });

  describe("restaurant validation", function() {
    it("can check that a list of restaurants has been provided", async function() {
      GivenANewLunchCycleCommand();
      await WhenANewLunchCycleIsCreatedWith([], "2020-01-01T00:00:00+01:00");
      ThenANewLunchCycleIsNotCreated();
    });
  });

  describe("slack request validation", function() {
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
    lunchCycleGateway: inMemoryLunchCycleGateway
  });
  createNewLunchCycleResponse = await useCase.execute({
    restaurants: restaurants,
    startsAt: startsAt
  });
}

function ThenANewLunchCycleIsCreated() {
  expect(createNewLunchCycleResponse.lunchCycle).to.not.be.undefined;
}

function ThenTheUserIsValid() {
  var useCase = new IsLunchinatorAdmin();
  var response = useCase.execute({ userId: slashCommandResponse.body.user_id });
  expect(response.isValid).to.be.true;
}

function GivenANewLunchCycleCommandWithInvalidUser() {
  slashCommandResponse = new SlashCommandFactory().getCommand({}, { user_id: "invalid_user" });
}

function ThenTheUserIsNotValid() {
  var useCase = new IsLunchinatorAdmin();
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
