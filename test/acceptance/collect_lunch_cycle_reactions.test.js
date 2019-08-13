const { expect } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle, Luncher } = require("@domain");
const { FakeSlackClient } = require("../fakes");
const {
  SlackGateway,
  InMemoryLunchCycleGateway,
  InMemorySlackUserResponseGateway
} = require("@gateways");
const { FetchReactionsForLuncher, UpdateLuncherReactions } = require("@use_cases");

let lunchCycle;
let luncher;
let fetchReactionsResponse;
let updateResponse;
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

  it("can get reactions for a Luncher", async function() {
    await GivenASlackUserResponseExists();
    await WhenReactionsAreRetrivedForTheLuncher();
    ThenReturnsTheReactions();
  });

  it("can update a Luncher with the reactions", async function() {
    await GivenASlackUserResponseExists();
    GivenReactionsForLuncherExists();
    await WhenTheLuncherIsUpdatedWithTheReactions();
    ThenTheLuncherHasCorrectEmojis();
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

  luncher = await inMemorySlackUserResponseGateway.create({
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

async function WhenReactionsAreRetrivedForTheLuncher() {
  const useCase = new FetchReactionsForLuncher({
    slackGateway: new SlackGateway()
  });

  fetchReactionsResponse = await useCase.execute({ luncher });
}

function ThenReturnsTheReactions() {
  expect(fetchReactionsResponse.reactions).to.eql({
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

function GivenReactionsForLuncherExists() {
  fetchReactionsResponse = {
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

async function WhenTheLuncherIsUpdatedWithTheReactions() {
  const useCase = new UpdateLuncherReactions({
    slackUserResponseGateway: inMemorySlackUserResponseGateway,
    lunchCycleGateway: inMemoryLunchCycleGateway
  });

  updateResponse = await useCase.execute({
    luncher,
    reactions: fetchReactionsResponse.reactions
  });
}

function ThenTheLuncherHasCorrectEmojis() {
  expect(updateResponse.updatedLuncher).to.eql(
    new Luncher({
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
