const { expect } = require("../test_helper");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");
const { FakeSlackClient } = require("../fakes");
const { LunchCycle, SlackUserResponse } = require("@domain");
const { SlackGateway, InMemorySlackUserResponseGateway } = require("@gateways");
const {
  SendDirectMessageToSlackUser,
  IsValidLunchinatorUser,
  FetchAllSlackUsers
} = require("@use_cases");

let lunchCycle;
let slashCommandResponse;
let fetchAllSlackUsersResponse;
let sendDirectMessageToSlackUserResponse;
let userList;
let fakeSlackClient;

describe("ReceiveSendLunchCycleSlashCommand", function() {
  before(function() {
    fakeSlackClient = new FakeSlackClient({ token: "NOT_VALID" });
    SlackGateway.prototype._slackClient = () => fakeSlackClient;

    userList = [{ id: "U2147483697", profile: { email: "test@example.com", first_name: "Test" } }];
    fakeSlackClient.stubUserList(userList);
  });

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

  it("can get all users", async function() {
    GivenASendLunchCycleCommand();
    WhenTheUserIsValid();
    await WhenAllTheSlackUsersAreFetched();
    ThenAListOfSlackUsersAreReturned();
  });

  it("can send direct messages to all users", async function() {
    GivenALunchCycleExists();
    GivenAListOfSlackUsers();
    await WhenTheDirectMessagesAreCreated();
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
  slashCommandResponse.body.user_id = "NOT_VALID_USER";
}

function GivenASendLunchCycleCommand() {
  slashCommandResponse = new SlashCommandFactory().getCommand(
    {},
    {
      command: "/lunchinator_send"
    }
  );
}

function GivenAListOfSlackUsers() {
  // No op as `listOfSlackUsers` exists
}

function ThenTheUserIsValid() {
  const useCase = new IsValidLunchinatorUser();
  const response = useCase.execute({ userId: slashCommandResponse.body.user_id });
  expect(response.isValid).to.be.true;
}

function ThenTheUserIsNotValid() {
  const useCase = new IsValidLunchinatorUser();
  const response = useCase.execute({ userId: slashCommandResponse.body.user_id });
  expect(response.isValid).to.be.false;
}

async function WhenAllTheSlackUsersAreFetched() {
  const useCase = new FetchAllSlackUsers({
    slackGateway: new SlackGateway()
  });

  fetchAllSlackUsersResponse = await useCase.execute();
}

function ThenAListOfSlackUsersAreReturned() {
  expect(fetchAllSlackUsersResponse.slackUsers).to.eql([
    { id: "U2147483697", profile: { email: "test@example.com", first_name: "Test" } }
  ]);
}

async function WhenTheDirectMessagesAreCreated() {
  const fakeSlackGateway = new SlackGateway();
  const useCase = new SendDirectMessageToSlackUser({
    slackGateway: fakeSlackGateway,
    slackUserResponseGateway: new InMemorySlackUserResponseGateway()
  });

  const slackUsers = await fakeSlackGateway.fetchUsers();

  sendDirectMessageToSlackUserResponse = await useCase.execute({
    slackUser: slackUsers[0],
    lunchCycle: lunchCycle
  });
}

function ThenDirectMessagesAreSent() {
  expect(sendDirectMessageToSlackUserResponse.slackMessageResponse).to.eql({
    ok: true,
    channel: "DM_CHANNEL_ID",
    ts: "1564484225.000400",
    message: {
      type: "message",
      subtype: "bot_message",
      text: "Hello from Node!",
      ts: "1564484225.000400",
      username: "Lunchinator",
      bot_id: "BOT_ID"
    }
  });
  expect(sendDirectMessageToSlackUserResponse.slackUserResponse).to.eql(
    new SlackUserResponse({
      slackUserId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 5,
      availableEmojis: []
    })
  );
}
