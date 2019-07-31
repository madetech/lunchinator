const { expect, sinon } = require("../test_helper");
const { FetchReactionsForSlackUserResponse } = require("@use_cases");

describe("FetchReactionsForSlackUserResponse", function() {
  it("can use the slack gateway to get reactions", async function() {
    const expectedReactions = {};
    const slackUserResponse = {
      userId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID_1",
      messageId: "1564484225.000400",
      lunchCycleId: 5,
      availableEmojis: []
    };

    const slackGatewaySpy = { fetchReactionsFromMessage: sinon.fake.resolves(expectedReactions) };
    const useCase = new FetchReactionsForSlackUserResponse({
      slackGateway: slackGatewaySpy
    });

    const response = await useCase.execute({ slackUserResponse: slackUserResponse });
    expect(response.reactions).to.equal(expectedReactions);

    expect(slackGatewaySpy.fetchReactionsFromMessage).to.have.been.calledWith({
      timestamp: slackUserResponse.messageId,
      channel: slackUserResponse.messageChannel
    });
  });
});
