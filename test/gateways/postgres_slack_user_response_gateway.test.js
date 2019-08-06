const { expect, clearPostgres } = require("../test_helper");
const { LunchCycle, SlackUserResponse } = require("@domain");
const { PostgresLunchCycleGateway, PostgresSlackUserResponseGateway } = require("@gateways");

describe("PostgresSlackUserResponseGateway", function() {
  let lunchCycle;

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

  beforeEach(async function() {
    await clearPostgres();
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();

    lunchCycle = await postgresLunchCycleGateway.create(new LunchCycle());
  });

  it("can create a Slack User Response", async function() {
    const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();

    const slackUserResponse = await postgresSlackUserResponseGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    expect(slackUserResponse).to.eql(
      new SlackUserResponse({
        slackUserId: "U2147483697",
        email: "test@example.com",
        firstName: "Test",
        messageChannel: "DM_CHANNEL_ID",
        messageId: "1564484225.000400",
        lunchCycleId: lunchCycle.id,
        availableEmojis: []
      })
    );
  });

  it("can count", async function() {
    const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();

    expect(await postgresSlackUserResponseGateway.count()).to.eql(0);

    await postgresSlackUserResponseGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    expect(await postgresSlackUserResponseGateway.count()).to.eql(1);
  });

  it("can save the correct record", async function() {
    const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();

    const res1 = await postgresSlackUserResponseGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });
    await postgresSlackUserResponseGateway.create({
      slackUser: { ...slackUser, id: "U123" },
      slackMessageResponse,
      lunchCycle
    });

    const returnedSlackUserResponse = await postgresSlackUserResponseGateway.saveEmojis({
      slackUserResponse: res1,
      emojis: [":pizza", ":sushi:"]
    });

    expect(returnedSlackUserResponse.slackUserId).to.eql(slackUser.id);
    expect(returnedSlackUserResponse.availableEmojis).to.eql([":pizza", ":sushi:"]);
  });

  it("can retrive all Slack User Responses for a given lunchCycle", async function() {
    const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();

    await postgresSlackUserResponseGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });
    const firstOrderedSlackUserResponse = await postgresSlackUserResponseGateway.create({
      slackUser: { ...slackUser, id: "U123" },
      slackMessageResponse,
      lunchCycle
    });

    const emptyList = await postgresSlackUserResponseGateway.findAllForLunchCycle({
      lunchCycle: { id: lunchCycle.id + 99 }
    });
    expect(emptyList.length).to.eql(0);

    const listWithResults = await postgresSlackUserResponseGateway.findAllForLunchCycle({
      lunchCycle
    });
    expect(listWithResults.length).to.eql(2);
    expect(listWithResults[0]).to.eql(firstOrderedSlackUserResponse);
  });
});
