const { expect } = require("../test_helper");
const { Luncher } = require("@domain");
const { InMemorySlackUserResponseGateway } = require("@gateways");

describe("InMemorySlackUserResponseGateway", function() {
  it("can create a new SlackUserResponse", async function() {
    const gateway = new InMemorySlackUserResponseGateway();

    const slackUser = {
      id: "U2147483697",
      profile: { email: "test@example.com", first_name: "Test" }
    };
    const slackMessageResponse = {
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
    };
    const lunchCycle = { id: 123 };

    expect(await gateway.count()).to.eql(0);

    const luncher = await gateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    expect(await gateway.count()).to.eql(1);

    expect(luncher).to.eql(
      new Luncher({
        slackUserId: "U2147483697",
        email: "test@example.com",
        firstName: "Test",
        messageChannel: "DM_CHANNEL_ID",
        messageId: "1564484225.000400",
        lunchCycleId: 123,
        availableEmojis: []
      })
    );
  });
});
