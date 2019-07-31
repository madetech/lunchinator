const { expect, sinon } = require("../test_helper");
const { SendDirectMessageToSlackUser } = require("@use_cases");
const { SlackMessage } = require("@domain");

describe("SendDirectMessageToSlackUser", function() {
  it("uses SlackGateway to send message", async function() {
    const gatewaySpy = { sendMessage: sinon.fake.returns(true) };
    const slackUserResponseStub = { create: sinon.fake.resolves({}) };
    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewaySpy,
      slackUserResponseGateway: slackUserResponseStub
    });
    const lunchCycleDummy = {};
    const slackUserDummy = {};

    const response = await useCase.execute({
      slackUser: slackUserDummy,
      lunchCycle: lunchCycleDummy
    });

    expect(gatewaySpy.sendMessage).to.have.been.calledWith(
      slackUserDummy,
      sinon.match.instanceOf(SlackMessage)
    );
    expect(response.slackMessageResponse).to.equal(true);
  });

  it("uses SlackUserResponseGateway to store the info we need", async function() {
    const slackResponseDummy = {};
    const gatewayStub = { sendMessage: sinon.fake.returns(slackResponseDummy) };
    const slackUserResponseDummy = {};
    const slackUserResponseSpy = { create: sinon.fake.resolves(slackUserResponseDummy) };
    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewayStub,
      slackUserResponseGateway: slackUserResponseSpy
    });
    const lunchCycleDummy = {};
    const slackUserDummy = {};

    const response = await useCase.execute({
      slackUser: slackUserDummy,
      lunchCycle: lunchCycleDummy
    });

    expect(slackUserResponseSpy.create).to.have.been.calledWith({
      slackUser: slackUserDummy,
      slackMessageResponse: slackResponseDummy,
      lunchCycle: lunchCycleDummy
    });
    expect(response.slackUserResponse).to.equal(slackUserResponseDummy);
  });
});
