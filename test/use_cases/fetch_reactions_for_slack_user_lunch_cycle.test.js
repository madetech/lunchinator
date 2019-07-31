const { expect, sinon } = require("../test_helper");
const { FetchReactionsForSlackUserLunchCycle } = require("@use_cases");

describe("FetchReactionsForSlackUserLunchCycle", function() {
  it("can use the slack gateway to get reactions", async function() {
    const expectedReactions = {};
    const slackUserLunchCycle = {
      userId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID_1",
      messageId: "1564484225.000400",
      lunchCycleId: 5,
      availableEmojis: []
    };

    const slackGatewaySpy = { fetchReactionsFromMessage: sinon.fake.resolves(expectedReactions) };
    const useCase = new FetchReactionsForSlackUserLunchCycle({
      slackGateway: slackGatewaySpy
    });

    const response = await useCase.execute({ slackUserLunchCycle: slackUserLunchCycle });
    expect(response.reactions).to.equal(expectedReactions);

    expect(slackGatewaySpy.fetchReactionsFromMessage).to.have.been.calledWith({
      timestamp: slackUserLunchCycle.messageId,
      channel: slackUserLunchCycle.messageChannel
    });
  });
});
