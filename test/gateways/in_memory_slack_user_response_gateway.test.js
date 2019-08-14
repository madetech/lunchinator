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

  it("can save", async function() {
    const gateway = new InMemorySlackUserResponseGateway();
    const luncher = new Luncher({
      slackUserId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    });

    gateway.lunchers = [{ ...luncher }];

    expect(await gateway.count()).to.eql(1);

    const updatedLuncher = await gateway.saveEmojis({
      luncher,
      emojis: [":pizza:"]
    });

    expect(await gateway.count()).to.eql(1);

    expect(updatedLuncher.messageId).to.eql(luncher.messageId);
    expect(updatedLuncher.availableEmojis).to.not.equal(luncher.availableEmojis);
  });

  it("can find correct lunch cycle", async function() {
    const gateway = new InMemorySlackUserResponseGateway();
    const luncher1 = new Luncher({
      slackUserId: "U1",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    });
    const luncher2 = new Luncher({
      slackUserId: "U2",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    });
    const luncher3 = new Luncher({
      slackUserId: "U3",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 12345,
      availableEmojis: []
    });
    const lunchCycle = { id: 123 };

    gateway.lunchers = [luncher1, luncher2, luncher3];

    const results = await gateway.findAllForLunchCycle({ lunchCycle });

    expect(results).to.eql([luncher1, luncher2]);
  });
});
