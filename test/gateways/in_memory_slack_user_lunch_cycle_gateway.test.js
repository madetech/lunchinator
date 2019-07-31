const { expect } = require("../test_helper");
const { InMemorySlackUserLunchCycleGateway } = require("@gateways");

describe("InMemorySlackUserLunchCycleGateway", function() {
  it("can create a new SlackUserLunchCycle", async function() {
    const gateway = new InMemorySlackUserLunchCycleGateway();

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

    const newSlackUserLunchCycle = await gateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    expect(await gateway.count()).to.eql(1);

    expect(newSlackUserLunchCycle).to.eql({
      userId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    });
  });

  it("can save", async function() {
    const gateway = new InMemorySlackUserLunchCycleGateway();
    const slackUserLunchCycle = {
      userId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    };

    gateway.slackUserLunchCycles = [{ ...slackUserLunchCycle }];

    slackUserLunchCycle.availableEmojis = [":pizza:"];

    expect(await gateway.count()).to.eql(1);

    const returnedSlackUserLunchCycle = await gateway.save({ slackUserLunchCycle });

    expect(await gateway.count()).to.eql(1);

    expect(returnedSlackUserLunchCycle).to.not.equal(slackUserLunchCycle);
    expect(returnedSlackUserLunchCycle).to.eql(slackUserLunchCycle);
  });
});
