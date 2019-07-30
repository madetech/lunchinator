const { expect, sinon } = require("../test_helper");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");
const { SlackGateway } = require("@gateways");
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

class FakeSlackClient {
  constructor({ token }) {
    this.token = token;
    this.users = {
      list: () => {}
    };

    // Easy way to get the Promise interface working.
    sinon.stub(this.users, "list").resolves({
      ok: true,
      members: userList
    });
  }
}

describe("ReceiveSendLunchCycleSlashCommand", function() {
  before(function() {
    SlackGateway.prototype._slackClient = () => new FakeSlackClient({ token: "NOT_VALID" });

    userList = [{ id: "U2147483697", profile: { email: "test@example.com", first_name: "Test" } }];

    // Fake sendmessage
    SlackGateway.prototype.sendMessage = () => {
      return { ts: "1503435956.000247", channel: "C1H9RESGL" };
    };
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
    slackUserLunchCycleGateway: new FakeSlackUserLunchCycleGateway()
  });

  const slackUsers = await fakeSlackGateway.fetchUsers();

  sendDirectMessageToSlackUserResponse = useCase.execute({
    slackUser: slackUsers[0],
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
