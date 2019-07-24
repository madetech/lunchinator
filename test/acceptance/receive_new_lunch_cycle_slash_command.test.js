const { expect } = require("../test_helper");
const SlashCommandFactory = require("./slash_command_factory");
const IsValidLunchinatorUser = require("@use_cases/is_valid_lunchinator_user");
const CreateNewLunchCycle = require("@use_cases/create_new_lunch_cycle");
const GetLastLunchCycle = require("@use_cases/get_last_lunch_cycle");
const SendLunchCyclePreview = require("@use_cases/send_lunch_cycle_preview");

class FakeInMemoryLunchCycleGateway {
  constructor() {
    this.lunchCycles = [];
  }

  create(lunchCycle) {
    this.lunchCycles.push(lunchCycle);
    return lunchCycle;
  }

  last() {
    const [last] = this.lunchCycles.slice(-1);
    return last;
  }
}

class FakeSlackGateway {
  sendMessage(slackMessage) {
    return true;
  }
}

let fakeGateway;
let slashCommandParams;
let theLunchCycleWeCreatedResponse;

describe("ReceiveNewLunchCycleSlashCommand", function() {
  beforeEach(function() {
    fakeGateway = new FakeInMemoryLunchCycleGateway();
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

  xit("cannot create a new lunch cycle when the user is not valid", function() {
    GivenANewLunchCycleCommandWithInvalidUser();
    WhenANewLunchCycleIsCreated();
    ThenANewLunchCycleIsNotCreated();
  });

  it("can send a preview message", function() {});
});

function GivenANewLunchCycleCommand() {
  slashCommandParams = new SlashCommandFactory().getCommand();
}

function WhenANewLunchCycleIsCreated() {
  var useCase = new CreateNewLunchCycle({ gateway: fakeGateway });
  theLunchCycleWeCreatedResponse = useCase.execute();
}

function ThenANewLunchCycleIsCreated() {
  var useCase = new GetLastLunchCycle({ gateway: fakeGateway });
  var lunchCycle = useCase.execute().lastLunchCycle;
  expect(lunchCycle).to.equal(theLunchCycleWeCreatedResponse.lunchCycle);
}

function ThenTheUserIsValid() {
  var useCase = new IsValidLunchinatorUser();
  var { isValid } = useCase.execute({ userId: slashCommandParams.user_id });
  expect(isValid).to.be.true;
}

function GivenANewLunchCycleCommandWithInvalidUser() {
  slashCommandParams = new SlashCommandFactory().getCommand({
    user_id: "invalid_user"
  });
}

function ThenTheUserIsNotValid() {
  var useCase = new IsValidLunchinatorUser();
  var { isValid } = useCase.execute({ userId: slashCommandParams.user_id });
  expect(isValid).to.be.false;
}

function ThenALunchCyclePreviewIsSentToUser() {
  var fakeSlackGateway = new FakeSlackGateway();
  var useCase = new SendLunchCyclePreview({ gateway: fakeSlackGateway });
  var sent = useCase.execute().slackResponse;
  expect(sent).to.be.true;
}
