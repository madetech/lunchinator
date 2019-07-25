const { expect } = require("../test_helper");
const { SlashCommandFactory } = require("../factories");

const { LunchCycle } = require("@domain");
const { InMemoryLunchCycleGateway } = require("@gateways");
const { IsValidLunchinatorUser, CreateNewLunchCycle } = require("@use_cases");

let inMemoryLunchCycleGateway;
let slashCommandParams;
let createNewLunchCycleResponse;

describe("ReceiveNewLunchCycleSlashCommand", function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
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
});

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

function ThenTheTotalCountOfLunchCyclesIs(count) {
  expect(count).to.eq(inMemoryLunchCycleGateway.count());
}
