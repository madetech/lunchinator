const { sinon, expect } = require("../test_helper");
const { FindNonResponderIds } = require("@use_cases");
describe("FindNonResponderIds", function() {
  it("can find non responders when no one has responded", async function() {
    const users = [
      { slackUserId: "user1", availableEmojis: [] },
      { slackUserId: "user2", availableEmojis: [] }
    ];

    const expectedUserIds = ["user1", "user2"];

    const useCase = new FindNonResponderIds({
      userResponseGateway: { findAllForLunchCycle: sinon.fake.returns(users) },
      lunchCycleGateway: { getCurrent: sinon.stub().returns({ id: "1" }) }
    });

    const response = await useCase.execute();
    expect(response.nonResponderIds).to.eql(expectedUserIds);
  });

  it("can find non responders when one person has responded", async function() {
    const users = [
      { slackUserId: "user1", availableEmojis: [] },
      { slackUserId: "user2", availableEmojis: [":emoji"] }
    ];

    const expectedUserIds = ["user1"];

    const useCase = new FindNonResponderIds({
      userResponseGateway: { findAllForLunchCycle: sinon.stub().returns(users) },
      lunchCycleGateway: { getCurrent: sinon.stub().returns({ id: "1" }) }
    });
    const response = await useCase.execute();
    expect(response.nonResponderIds).to.eql(expectedUserIds);
  });

  it("can't find non responders when everyone has responded", async function() {
    const users = [
      { id: "user1", availableEmojis: [":emoji:"] },
      { id: "user2", availableEmojis: [":emoji:"] }
    ];

    const useCase = new FindNonResponderIds({
      userResponseGateway: { findAllForLunchCycle: sinon.stub().returns(users) },
      lunchCycleGateway: { getCurrent: sinon.stub().returns({ id: "1" }) }
    });

    const response = await useCase.execute();
    expect(response.nonResponderIds).to.eql([]);
  });
  
  xit("can find non responders when no one has marked they're available", async function() {
    const users = [
      { slackUserId: "user1", available: false },
      { slackUserId: "user2", available: false }
    ];

    const expectedUserIds = ["user1", "user2"];

    const useCase = new FindNonResponderIds({
      userResponseGateway: { findAllForLunchCycle: sinon.fake.returns(users) },
      lunchCycleGateway: { getCurrent: sinon.stub().returns({ id: "1" }) }
    });

    const response = await useCase.executeTWO();
    expect(response.nonResponderIds).to.eql(expectedUserIds);
  });
});
