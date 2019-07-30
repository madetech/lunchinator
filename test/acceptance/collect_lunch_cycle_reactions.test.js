const { expect, sinon } = require("../test_helper");
const { SlackGateway } = require("@gateways");
const { FetchReactionsForSlackUserLunchCycle } = require("@use_cases");

let lunchCycle;
let slackUserLunchCycle;
let fetchReactionsUseCaseResponse;

describe("Collect Lunch Cycle Reactions", function() {
  before(function() {
    SlackGateway.prototype._slackClient = () => new FakeSlackClient({ token: "NOT_VALID" });
  });

  it("can get reactions for a Slack User Lunch Cycle", async function() {
    GivenASlackUserLunchCycleExists();
    await WhenReactionsAreRetrivedForTheSlackUserLunchCycle();
    ThenReturnsTheReactions();
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
  slackUserLunchCycle = {
    userId: "U2147483697",
    email: "test@example.com",
    firstName: "Test",
    messageChannel: "DM_CHANNEL_ID_1",
    messageId: "1564484225.000400",
    lunchCycleId: 5,
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
