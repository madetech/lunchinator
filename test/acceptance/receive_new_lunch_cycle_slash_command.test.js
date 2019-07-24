const { expect } = require("../test_helper");
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

let fakeGateway;
let slashCommandParams;
let theLunchCycleWeCreatedResponse;

describe("ReceiveNewLunchCycleSlashCommand", function() {
  beforeEach(function() {
    fakeGateway = new FakeInMemoryLunchCycleGateway();
  });

  it("can create a new lunch cycle", function() {
    GivenAValidNewLunchCycleSlashCommand();
    WhenTheCommandIsFromAValidUser();
    WhenANewLunchCycleIsCreated();
    ThenANewLunchCycleIsCreated();
    ThenALunchCyclePreviewIsSentToUser();
  });

  xit("cannot create a new lunch cycle when the user is not valid", function() {
    GivenANonValidNewLunchCycleSlashCommand();
    WhenTheCommandIsFromANotValidUser();
    ThenALunchCycleIsNotCreated();
    ThenAErrorMessageIsSentToUser();
  });
});

function GivenAValidNewLunchCycleSlashCommand() {
  slashCommandParams = {
    token: "gIkuvaNzQIHg97ATvDxqgjtO",
    team_id: "madetechteam",
    team_domain: "example",
    enterprise_id: "E0001",
    enterprise_name: "MadeTech",
    channel_id: "C2147483705",
    channel_name: "test",
    user_id: "U2147483697",
    user_name: "Steve",
    command: "/lunchinator_new",
    text: "we dont use this",
    response_url: "https://hooks.slack.com/commands/1234/5678",
    trigger_id: "13345224609.738474920.8088930838d88f008e0"
  };
}

function WhenTheCommandIsFromAValidUser() {
  var useCase = new IsValidLunchinatorUser(slashCommandParams);
  var isValid = useCase.execute().isValid;
  expect(isValid).to.be.true;
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

class FakeSlackGateway {
  sendMessage(slackMessage) {
    return true;
  }
}

function ThenALunchCyclePreviewIsSentToUser() {
  var fakeSlackGateway = new FakeSlackGateway();
  var useCase = new SendLunchCyclePreview({ gateway: fakeSlackGateway });
  var sent = useCase.execute().slackResponse;
  expect(sent).to.be.true;
}
