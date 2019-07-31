const { expect, sinon } = require("../test_helper");
const { SendDirectMessageToSlackUser } = require("@use_cases");
const { SlackMessage } = require("@domain");

describe("SendDirectMessageToSlackUser", function() {
  it("uses SlackGateway to send message", async function() {
    const gatewaySpy = { sendMessage: sinon.fake.returns(true) };
    const slackUserLunchCycleStub = { recordSlackUserLunchCycle: sinon.fake.returns(true) };
    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewaySpy,
      slackUserLunchCycleGateway: slackUserLunchCycleStub
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

  it("uses SlackUserLunchCycleGateway to store the info we need", async function() {
    const slackResponseDummy = {};
    const gatewayStub = { sendMessage: sinon.fake.returns(slackResponseDummy) };
    const slackUserLunchCycleSpy = {
      recordSlackUserLunchCycle: sinon.fake.returns({ slackUserLunchCycle: true })
    };
    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewayStub,
      slackUserLunchCycleGateway: slackUserLunchCycleSpy
    });
    const lunchCycleDummy = {};
    const slackUserDummy = {};

    const response = await useCase.execute({
      slackUser: slackUserDummy,
      lunchCycle: lunchCycleDummy
    });

    expect(slackUserLunchCycleSpy.recordSlackUserLunchCycle).to.have.been.calledWith(
      slackUserDummy,
      slackResponseDummy,
      lunchCycleDummy
    );
    expect(response.slackUserLunchCycle).to.equal(true);
  });
});
