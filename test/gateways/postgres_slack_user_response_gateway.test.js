const { expect, clearPostgres } = require("../test_helper");
const { LunchCycle, Luncher } = require("@domain");
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

    const luncher = await postgresSlackUserResponseGateway.create({
      slackUser,
      slackMessageResponse,
      lunchCycle
    });

    expect(luncher).to.eql(
      new Luncher({
        slackUserId: "U2147483697",
        email: "test@example.com",
        firstName: "Test",
        messageChannel: "DM_CHANNEL_ID",
        messageId: "1564484225.000400",
        lunchCycleId: lunchCycle.id,
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
});
