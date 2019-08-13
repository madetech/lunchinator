const { sinon, expect } = require("../test_helper");
const { FindNonResponderIds } = require("@use_cases");
const { InMemorySlackUserResponseGateway } = require("@gateways");

describe("DealWithNonResponders", function() {
  it("can find non responders when no one has responded", async function() {
    const expectedUserIds = ["1", "2"];

    const userResponseGateway = new InMemorySlackUserResponseGateway();
    const lunchCycleGateway = { getCurrent: sinon.stub().returns({ id: "1" }) };

    await userResponseGateway.create({
      slackUser: { id: "1", profile: { first_name: "user1", email: "test1@test.com" } },
      slackMessageResponse: { channel: "ch", ts: "ts1" },
      lunchCycle: { id: "1" }
    });

    await userResponseGateway.create({
      slackUser: { id: "2", profile: { first_name: "user2", email: "test2@test.com" } },
      slackMessageResponse: { channel: "ch", ts: "ts2" },
      lunchCycle: { id: "1" }
    });

    const useCase = new FindNonResponderIds({
      lunchCycleGateway: lunchCycleGateway,
      userResponseGateway: userResponseGateway
    });
    const response = await useCase.execute();
    expect(response.nonResponders).to.eql(expectedUserIds);
  });

  it("can find non responders when one person has responded", async function() {
    const expectedUserIds = ["2"];

    const userResponseGateway = new InMemorySlackUserResponseGateway();
    const lunchCycleGateway = { getCurrent: sinon.stub().returns({ id: "1" }) };
    const useCase = new FindNonResponderIds({
      userResponseGateway: userResponseGateway,
      lunchCycleGateway: lunchCycleGateway
    });

    const luncher1 = await userResponseGateway.create({
      slackUser: { id: "1", profile: { first_name: "user1", email: "test1@test.com" } },
      slackMessageResponse: { channel: "ch", ts: "ts1" },
      lunchCycle: { id: "1" }
    });

    await userResponseGateway.create({
      slackUser: { id: "2", profile: { first_name: "user2", email: "test2@test.com" } },
      slackMessageResponse: { channel: "ch", ts: "ts2" },
      lunchCycle: { id: "1" }
    });

    await userResponseGateway.saveEmojis({
      luncher: luncher1,
      emojis: [":emoji:"]
    });

    const response = await useCase.execute();
    expect(response.nonResponders).to.eql(expectedUserIds);
  });

  it("can't find non responders when everyone has responded", async function() {
    const userResponseGateway = new InMemorySlackUserResponseGateway();
    const lunchCycleGateway = { getCurrent: sinon.stub().returns({ id: "1" }) };
    const useCase = new FindNonResponderIds({
      userResponseGateway: userResponseGateway,
      lunchCycleGateway: lunchCycleGateway
    });

    const luncher1 = await userResponseGateway.create({
      slackUser: { id: "1", profile: { first_name: "user1", email: "test1@test.com" } },
      slackMessageResponse: { channel: "ch", ts: "ts1" },
      lunchCycle: { id: "1" }
    });

    const luncher2 = await userResponseGateway.create({
      slackUser: { id: "2", profile: { first_name: "user2", email: "test2@test.com" } },
      slackMessageResponse: { channel: "ch", ts: "ts2" },
      lunchCycle: { id: "1" }
    });

    await userResponseGateway.saveEmojis({
      luncher: luncher1,
      emojis: [":emoji:"]
    });

    await userResponseGateway.saveEmojis({
      luncher: luncher2,
      emojis: [":emoji:"]
    });

    const response = await useCase.execute();
    expect(response.nonResponders).to.eql([]);
  });
});
