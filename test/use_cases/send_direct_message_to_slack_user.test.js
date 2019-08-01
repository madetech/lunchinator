const { expect, sinon } = require("../test_helper");
const { SendDirectMessageToSlackUser } = require("@use_cases");
const { SlackMessage } = require("@domain");

describe("SendDirectMessageToSlackUser", function() {
  const slackMessageDummy = { message: "" };
  const generateSlackMessage = { execute: sinon.fake.returns(slackMessageDummy) };

  it("uses SlackGateway to send message", async function() {
    const gatewaySpy = { sendMessage: sinon.fake.returns(true) };
    const slackUserLunchCycleStub = { create: sinon.fake.resolves({}) };

    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewaySpy,
      slackUserLunchCycleGateway: slackUserLunchCycleStub,
      generateSlackMessage: generateSlackMessage
    });
    const lunchCycleDummy = {};
    const slackUserDummy = { profile: { first_name: "Bob" } };

    const response = await useCase.execute({
      slackUser: slackUserDummy,
      lunchCycle: lunchCycleDummy
    });

    expect(gatewaySpy.sendMessage).to.have.been.calledWith(slackUserDummy, slackMessageDummy);
    expect(response.slackMessageResponse).to.equal(true);
  });

  it("uses SlackUserLunchCycleGateway to store the info we need", async function() {
    const slackResponseDummy = {};
    const gatewayStub = { sendMessage: sinon.fake.returns(slackResponseDummy) };
    const slackUserLunchCycleDummy = {};
    const slackUserLunchCycleSpy = { create: sinon.fake.resolves(slackUserLunchCycleDummy) };
    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewayStub,
      slackUserLunchCycleGateway: slackUserLunchCycleSpy,
      generateSlackMessage: generateSlackMessage
    });

    const lunchCycleDummy = {};
    const slackUserDummy = { profile: { first_name: "Bob" } };

    const response = await useCase.execute({
      slackUser: slackUserDummy,
      lunchCycle: lunchCycleDummy
    });

    expect(slackUserLunchCycleSpy.create).to.have.been.calledWith({
      slackUser: slackUserDummy,
      slackMessageResponse: slackResponseDummy,
      lunchCycle: lunchCycleDummy
    });
    expect(response.slackUserLunchCycle).to.equal(slackUserLunchCycleDummy);
  });
});
