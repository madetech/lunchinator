const { expect, sinon } = require("../test_helper");
const moment = require("moment");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");
const { FakeSlackClient } = require("../fakes");
const { LunchCycle } = require("@domain");
const { SlackGateway, InMemorySlackUserResponseGateway } = require("@gateways");
const {
  SendDirectMessageToSlackUser,
  FetchAllSlackUsers,
  GenerateLunchersMessage,
  IsLunchinatorAdmin
} = require("@use_cases");

let lunchCycle;
let slashCommandResponse;
let fetchAllSlackUsersResponse;
let sendDirectMessageResponses = [];
let userList;
let fakeSlackClient;

describe("ReceiveSendLunchCycleSlashCommand", function() {
  before(function() {
    fakeSlackClient = new FakeSlackClient({ token: "token" });
    SlackGateway.prototype._slackClient = () => fakeSlackClient;

    userList = [
      { id: "U2147483697", profile: { email: "test1@example.com", first_name: "Test1" } },
      { id: "U2147483698", profile: { email: "test2@example.com", first_name: "Test2" } }
    ];
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

const startsAt = moment
  .utc()
  .startOf("isoWeek")
  .add(4, "days")
  .add(0, "week");

function GivenALunchCycleExists() {
  lunchCycle = new LunchCycle({
    id: 5,
    restaurants: [
      RestaurantFactory.getRestaurant({ emoji: ":tada:", date: startsAt.format("DD/MM/YYYY") })
    ],
    starts_at: startsAt
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
  const useCase = new IsLunchinatorAdmin();
  const response = useCase.execute({ userId: slashCommandResponse.body.user_id });
  expect(response.isValid).to.be.true;
}

function ThenTheUserIsNotValid() {
  const useCase = new IsLunchinatorAdmin();
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
  expect(fetchAllSlackUsersResponse.slackUsers).to.eql(userList);
}

async function WhenTheDirectMessagesAreCreated() {
  const fakeSlackGateway = new SlackGateway();
  const useCase = new SendDirectMessageToSlackUser({
    slackGateway: fakeSlackGateway,
    slackUserResponseGateway: new InMemorySlackUserResponseGateway(),
    generateLunchersMessage: new GenerateLunchersMessage(),
    lunchCycleGateway: { getCurrent: sinon.fake.returns(lunchCycle) }
  });

  const slackUsers = await fakeSlackGateway.fetchUsers();

  for (const u of slackUsers) {
    const response = await useCase.execute({
      slackUser: u,
      lunchCycle: lunchCycle
    });
    sendDirectMessageResponses.push(response);
  }
}

function ThenDirectMessagesAreSent() {
  sendDirectMessageResponses.forEach((r, i) => {
    expect(r.slackMessageResponse.blocks).to.eql([]);
    expect(r.luncher.email).to.eql(`${userList[i].profile.email}`);

    expect(fakeSlackClient.postMessageStub).to.have.been.calledWith({
      as_user: true,
      channel: userList[i].id,
      text: "",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Hey* ${userList[i].profile.first_name}! It’s time to enter the draw for the next ` +
              "cycle of company lunches.\n\n"
          }
        },
        { type: "divider" },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `:tada: ${startsAt.format("DD/MM/YYYY")}   <googlemaps|restaurant1>    ` +
              "vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  " +
              "halal:question:"
          }
        },
        {
          type: "actions",
          elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  emoji: false,
                  text: "Available"
                },
                value: "5-restaurant1" //lunch cycle id + restaurant name
              },
            ]
          },
          { type: "divider" },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                ":green_heart: = Great          :orange_heart: = Some      " +
                "    :broken_heart: = None          :question: = Unknown"
            }
          }
      ]
    });
  });
}
