const { expect } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle, SlackUserResponse } = require("@domain");
const { FakeSlackClient } = require("../fakes");
const {
  SlackGateway,
  InMemoryLunchCycleGateway,
  InMemorySlackUserResponseGateway
} = require("@gateways");
const {
  FetchReactionsForSlackUserResponse,
  UpdateSlackUserResponseWithReactions
} = require("@use_cases");

let lunchCycle;
let slackUserResponse;
let fetchReactionsUseCaseResponse;
let updateSULCWithReactions;
let inMemoryLunchCycleGateway;
let fakeSlackClient;
let inMemorySlackUserResponseGateway;

describe("Collect Lunch Cycle Reactions", function() {
  before(function() {
    fakeSlackClient = new FakeSlackClient({ token: "NOT_VALID" });
    SlackGateway.prototype._slackClient = () => fakeSlackClient;
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
    inMemorySlackUserResponseGateway = new InMemorySlackUserResponseGateway();
  });

  it("can get reactions for a Slack User Response", async function() {
    await GivenASlackUserResponseExists();
    await WhenReactionsAreRetrivedForTheSlackUserResponse();
    ThenReturnsTheReactions();
  });

  it("can update a Slack User Response with the reactions", async function() {
    await GivenASlackUserResponseExists();
    GivenAFetchSlackReactionsForSlackUserResponseResponseExists();
    await WhenTheSlackUserResponseIsUpdatedWithTheReactions();
    ThenTheSlackUserResponseHasCorrectEmojis();
  });
});

async function GivenASlackUserResponseExists() {
  lunchCycle = await inMemoryLunchCycleGateway.create(
    new LunchCycle({
      restaurants: [
        RestaurantFactory.getRestaurant({ name: "Rest 1", emoji: ":pizza:" }),
        RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":tada:" }),
        RestaurantFactory.getRestaurant({ name: "Rest 3", emoji: ":sushi:" })
      ]
    })
  );

  slackUserResponse = await inMemorySlackUserResponseGateway.create({
    slackUser: {
      id: "U2147483697",
      profile: {
        email: "test@example.com",
        first_name: "Test"
      }
    },
    slackMessageResponse: {
      channel: "DM_CHANNEL_ID_1",
      ts: "1564484225.000400"
    },
    lunchCycle
  });
}

async function WhenReactionsAreRetrivedForTheSlackUserResponse() {
  const useCase = new FetchReactionsForSlackUserResponse({
    slackGateway: new SlackGateway()
  });

  fetchReactionsUseCaseResponse = await useCase.execute({
    slackUserResponse: slackUserResponse
  });
}

function ThenReturnsTheReactions() {
  expect(fetchReactionsUseCaseResponse.reactions).to.eql({
    ok: true,
    type: "message",
    channel: "DM_CHANNEL_ID_1",
    message: {
      type: "message",
      subtype: "bot_message",
      text: "Hello from Node!",
      ts: "1564484225.000400",
      username: "Lunchinator",
      bot_id: "BOT_ID",
      reactions: [
        { name: "pizza", users: ["U2147483697"], count: 1 },
        { name: "sushi", users: ["U2147483697"], count: 1 }
      ]
    }
  });
}

function GivenAFetchSlackReactionsForSlackUserResponseResponseExists() {
  fetchReactionsUseCaseResponse = {
    reactions: {
      ok: true,
      type: "message",
      channel: "DM_CHANNEL_ID_1",
      message: {
        type: "message",
        subtype: "bot_message",
        text: "Hello from Node!",
        ts: "1564484225.000400",
        username: "Lunchinator",
        bot_id: "BOT_ID",
        reactions: [
          { name: "pizza", users: ["U2147483697"], count: 1 },
          { name: "sushi", users: ["U2147483697"], count: 1 },
          { name: "simple_smile", users: ["U2147483697"], count: 1 }
        ]
      }
    }
  };
}

async function WhenTheSlackUserResponseIsUpdatedWithTheReactions() {
  const useCase = new UpdateSlackUserResponseWithReactions({
    slackUserResponseGateway: inMemorySlackUserResponseGateway,
    lunchCycleGateway: inMemoryLunchCycleGateway
  });

  updateSULCWithReactions = await useCase.execute({
    slackUserResponse: slackUserResponse,
    reactions: fetchReactionsUseCaseResponse.reactions
  });
}

function ThenTheSlackUserResponseHasCorrectEmojis() {
  expect(updateSULCWithReactions.slackUserResponse).to.eql(
    new SlackUserResponse({
      slackUserId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID_1",
      messageId: "1564484225.000400",
      lunchCycleId: lunchCycle.id,
      availableEmojis: [":pizza:", ":sushi:"]
    })
  );
}
