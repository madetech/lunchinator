const { expect } = require("../test_helper");
const { SlackUserResponse } = require("@domain");
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

    const newSlackUserResponse = await gateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    expect(await gateway.count()).to.eql(1);

    expect(newSlackUserResponse).to.eql(
      new SlackUserResponse({
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
    const slackUserResponse = new SlackUserResponse({
      slackUserId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    });

    gateway.slackUserResponses = [{ ...slackUserResponse }];

    slackUserResponse.availableEmojis = [":pizza:"];

    expect(await gateway.count()).to.eql(1);

    const returnedSlackUserResponse = await gateway.save({ slackUserResponse });

    expect(await gateway.count()).to.eql(1);

    expect(returnedSlackUserResponse).to.not.equal(slackUserResponse);
    expect(returnedSlackUserResponse).to.eql(slackUserResponse);
  });

  it("can find correct lunch cycle", async function() {
    const gateway = new InMemorySlackUserResponseGateway();
    const slackUserResponse1 = new SlackUserResponse({
      slackUserId: "U1",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    });
    const slackUserResponse2 = new SlackUserResponse({
      slackUserId: "U2",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 123,
      availableEmojis: []
    });
    const slackUserResponse3 = new SlackUserResponse({
      slackUserId: "U3",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID",
      messageId: "1564484225.000400",
      lunchCycleId: 12345,
      availableEmojis: []
    });
    const lunchCycle = { id: 123 };

    gateway.slackUserResponses = [slackUserResponse1, slackUserResponse2, slackUserResponse3];

    const results = await gateway.findAllForLunchCycle({ lunchCycle });

    expect(results).to.eql([slackUserResponse1, slackUserResponse2]);
  });
});
