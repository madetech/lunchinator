const { expect, sinon } = require("../test_helper");
const { SendDirectMessageToSlackUser } = require("@use_cases");

describe("SendDirectMessageToSlackUser", function() {
  const slackMessageDummy = { blocks: [] };
  const generateLunchersMessage = { execute: sinon.fake.returns(slackMessageDummy) };

  it("uses SlackGateway to send message", async function() {
    const lunchCycleDummy = {};
    const gatewaySpy = { sendMessageWithBlocks: sinon.fake.returns(true) };
    const slackUserResponseStub = { create: sinon.fake.resolves({}) };
    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewaySpy,
      slackUserResponseGateway: slackUserResponseStub,
      generateLunchersMessage: generateLunchersMessage,
      lunchCycleGateway: { getCurrent: sinon.fake.returns(lunchCycleDummy) }
    });

    const slackUserDummy = { profile: { first_name: "Bob" } };

    const response = await useCase.execute({
      slackUser: slackUserDummy,
      lunchCycle: lunchCycleDummy
    });
    expect(gatewaySpy.sendMessageWithBlocks).to.have.been.calledWith(
      slackUserDummy,
      slackMessageDummy
    );
    expect(response.slackMessageResponse).to.equal(true);
  });

  it("uses SlackUserResponseGateway to store the info we need", async function() {
    const slackResponseDummy = {};
    const lunchCycleDummy = {};
    const gatewayStub = { sendMessageWithBlocks: sinon.fake.returns(slackResponseDummy) };
    const slackUserResponseDummy = {};
    const slackUserResponseSpy = { create: sinon.fake.resolves(slackUserResponseDummy) };
    const useCase = new SendDirectMessageToSlackUser({
      slackGateway: gatewayStub,
      generateLunchersMessage: generateLunchersMessage,
      slackUserResponseGateway: slackUserResponseSpy,
      lunchCycleGateway: { getCurrent: sinon.fake.returns(lunchCycleDummy) }
    });

    const slackUserDummy = { profile: { first_name: "Bob" } };

    const response = await useCase.execute({
      slackUser: slackUserDummy,
      lunchCycle: lunchCycleDummy
    });

    expect(slackUserResponseSpy.create).to.have.been.calledWith({
      slackUser: slackUserDummy,
      slackMessageResponse: slackResponseDummy,
      lunchCycle: lunchCycleDummy
    });
    expect(response.luncher).to.equal(slackUserResponseDummy);
  });
});
