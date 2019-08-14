const { expect, sinon } = require("../test_helper");
const { FetchReactionsForLuncher } = require("@use_cases");

describe("FetchReactionsForLuncher", function() {
  it("can use the slack gateway to get reactions", async function() {
    const expectedReactions = {};
    const luncher = {
      userId: "U2147483697",
      email: "test@example.com",
      firstName: "Test",
      messageChannel: "DM_CHANNEL_ID_1",
      messageId: "1564484225.000400",
      lunchCycleId: 5,
      availableEmojis: []
    };

    const slackGatewaySpy = { fetchReactionsFromMessage: sinon.fake.resolves(expectedReactions) };
    const useCase = new FetchReactionsForLuncher({
      slackGateway: slackGatewaySpy
    });

    const response = await useCase.execute({ luncher });
    expect(response.reactions).to.equal(expectedReactions);

    expect(slackGatewaySpy.fetchReactionsFromMessage).to.have.been.calledWith({
      timestamp: luncher.messageId,
      channel: luncher.messageChannel
    });
  });
});
