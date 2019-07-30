const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");
const { SlackGateway, InMemoryLunchCycleGateway } = require("@gateways");
const {
  FetchReactionsForSlackUserLunchCycle,
  UpdateSlackUserLunchCycleWithReactions
} = require("@use_cases");

let lunchCycle;
let slackUserLunchCycle;
let fetchReactionsUseCaseResponse;
let updateSULCWithReactions;
let inMemoryLunchCycleGateway;

describe("Collect Lunch Cycle Reactions", function() {
  before(function() {
    SlackGateway.prototype._slackClient = () => new FakeSlackClient({ token: "NOT_VALID" });

    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
  });

  it("can get reactions for a Slack User Lunch Cycle", async function() {
    GivenASlackUserLunchCycleExists();
    await WhenReactionsAreRetrivedForTheSlackUserLunchCycle();
    ThenReturnsTheReactions();
  });

  it("can update a Slack User Lunch Cycle with the reactions", function() {
    GivenASlackUserLunchCycleExists();
    GivenAFetchSlackReactionsForSlackUserLunchCycleResponseExists();
    WhenTheSlackUserLunchCycleIsUpdatedWithTheReactions();
    ThenTheSlackUserLunchCycleHasCorrectEmojis();
  });
});

class FakeSlackClient {
  constructor({ token }) {
    this.token = token;
    this.reactions = {
      get: () => {}
    };

    const reactionsStub = sinon.stub(this.reactions, "get");

    reactionsStub
      .withArgs({
        channel: "DM_CHANNEL_ID_1",
        timestamp: "1564484225.000400"
      })
      .resolves({
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
}

function GivenASlackUserLunchCycleExists() {
  lunchCycle = inMemoryLunchCycleGateway.create(
    new LunchCycle({
      restaurants: [
        RestaurantFactory.getRestaurant({ name: "Rest 1", emoji: ":pizza:" }),
        RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":tada:" }),
        RestaurantFactory.getRestaurant({ name: "Rest 3", emoji: ":sushi:" })
      ]
    })
  );

  slackUserLunchCycle = {
    userId: "U2147483697",
    email: "test@example.com",
    firstName: "Test",
    messageChannel: "DM_CHANNEL_ID_1",
    messageId: "1564484225.000400",
    lunchCycleId: lunchCycle.id,
    availableEmojis: []
  };
}

async function WhenReactionsAreRetrivedForTheSlackUserLunchCycle() {
  const useCase = new FetchReactionsForSlackUserLunchCycle({
    slackGateway: new SlackGateway()
  });

  fetchReactionsUseCaseResponse = await useCase.execute({
    slackUserLunchCycle: slackUserLunchCycle
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

function GivenAFetchSlackReactionsForSlackUserLunchCycleResponseExists() {
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

function WhenTheSlackUserLunchCycleIsUpdatedWithTheReactions() {
  const useCase = new UpdateSlackUserLunchCycleWithReactions({
    slackUserLunchCycleGateway: { save: sinon.stub().returnsArg(0) },
    lunchCycleGateway: inMemoryLunchCycleGateway
  });

  updateSULCWithReactions = useCase.execute({
    slackUserLunchCycle: slackUserLunchCycle,
    reactions: fetchReactionsUseCaseResponse.reactions
  });
}

function ThenTheSlackUserLunchCycleHasCorrectEmojis() {
  expect(updateSULCWithReactions.slackUserLunchCycle).to.eql({
    userId: "U2147483697",
    email: "test@example.com",
    firstName: "Test",
    messageChannel: "DM_CHANNEL_ID_1",
    messageId: "1564484225.000400",
    lunchCycleId: lunchCycle.id,
    availableEmojis: [":pizza:", ":sushi:"]
  });
}
