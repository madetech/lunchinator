const { expect, sinon } = require("../test_helper");
const { FetchAllSlackUsers } = require("@use_cases");

describe("FetchAllSlackUsers", function() {
  it("uses the SlackGateway to fetch Slack Users", async function() {
    const response = { slackUsers: [] };
    const slackGatewaySpy = { fetchUsers: sinon.fake.resolves([]) };
    const useCase = new FetchAllSlackUsers({
      slackGateway: slackGatewaySpy
    });

    expect(await useCase.execute()).to.eql(response);

    expect(slackGatewaySpy.fetchUsers).to.have.been.called;
  });
});
