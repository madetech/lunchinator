const { expect } = require("../test_helper");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");
const {
  SendDirectMessageToSlackUser,
  IsValidLunchinatorUser,
  FetchAllSlackUsers
} = require("@use_cases");

let lunchCycle;
let slashCommandParams;
let fetchAllSlackUsersResponse;
let sendDirectMessageToSlackUserResponse;

describe("ReceiveSendLunchCycleSlashCommand", function() {
  it("can check for a valid user", function() {
    GivenASendLunchCycleCommand();
    WhenTheUserIsValid();
    ThenTheUserIsValid();
  });

  it("can check for an invalid user", function() {
    GivenASendLunchCycleCommand();
    WhenTheUserIsNotValid();
    ThenTheUserIsNotValid();
  });

  it("can get all users", function() {
    GivenASendLunchCycleCommand();
    WhenTheUserIsValid();
    WhenAllTheSlackUsersAreFetched();
    ThenAListOfSlackUsersAreReturned();
  });

  it("can send direct messages to all users", function() {
    GivenALunchCycleExists();
    GivenAListOfSlackUsers();
    WhenTheDirectMessagesAreCreated();
    ThenDirectMessagesAreSent();
  });
});

function GivenALunchCycleExists() {
  lunchCycle = new LunchCycle({
    id: 5,
    restaurants: [RestaurantFactory.getRestaurant({ emoji: ":tada:" })]
  });
}

function WhenTheUserIsValid() {
  // No Op as the factory contains a valid user
}

function WhenTheUserIsNotValid() {
  slashCommandParams.user_id = "NOT_VALID_USER";
}

function GivenASendLunchCycleCommand() {
  slashCommandParams = new SlashCommandFactory().getCommand({
    command: "/lunchinator_send"
  });
}

function GivenAListOfSlackUsers() {
  // No op as `listOfSlackUsers` exists
}

function ThenTheUserIsValid() {
  const useCase = new IsValidLunchinatorUser();
  const response = useCase.execute({ userId: slashCommandParams.user_id });
  expect(response.isValid).to.be.true;
}

function ThenTheUserIsNotValid() {
  const useCase = new IsValidLunchinatorUser();
  const response = useCase.execute({ userId: slashCommandParams.user_id });
  expect(response.isValid).to.be.false;
}

class FakeSlackGateway {
  sendMessage(slackUser, slackMessage) {
    return { ts: "1503435956.000247", channel: "C1H9RESGL" };
  }

  fetchUsers() {
    return [{ id: "U2147483697", profile: { email: "test@example.com", first_name: "Test" } }];
  }
}

class FakeSlackUserLunchCycleGateway {
  recordSlackUserLunchCycle(slackUser, slackResponse, lunchCycle) {
    return {
      slackUserLunchCycle: {
        userId: slackUser.id,
        email: slackUser.profile.email,
        firstName: slackUser.profile.first_name,
        lunchCycleId: lunchCycle.id,
        messageId: slackResponse.ts,
        messageChannel: slackResponse.channel,
        availableEmojis: []
      }
    };
  }
}

function WhenAllTheSlackUsersAreFetched() {
  const useCase = new FetchAllSlackUsers({
    slackGateway: new FakeSlackGateway()
  });

  fetchAllSlackUsersResponse = useCase.execute();
}

function ThenAListOfSlackUsersAreReturned() {
  expect(fetchAllSlackUsersResponse.slackUsers).to.eql([
    { id: "U2147483697", profile: { email: "test@example.com", first_name: "Test" } }
  ]);
}

function WhenTheDirectMessagesAreCreated() {
  const fakeSlackGateway = new FakeSlackGateway();
  const useCase = new SendDirectMessageToSlackUser({
    slackGateway: fakeSlackGateway,
    slackUserLunchCycleGateway: new FakeSlackUserLunchCycleGateway()
  });

  sendDirectMessageToSlackUserResponse = useCase.execute({
    slackUser: fakeSlackGateway.fetchUsers()[0],
    lunchCycle: lunchCycle
  });
}

function ThenDirectMessagesAreSent() {
  expect(sendDirectMessageToSlackUserResponse.slackMessageResponse).to.eql({
    ts: "1503435956.000247",
    channel: "C1H9RESGL"
  });
  expect(sendDirectMessageToSlackUserResponse.slackUserLunchCycle).to.eql({
    userId: "U2147483697",
    email: "test@example.com",
    firstName: "Test",
    messageChannel: "C1H9RESGL",
    messageId: "1503435956.000247",
    lunchCycleId: 5,
    availableEmojis: []
  });
}
