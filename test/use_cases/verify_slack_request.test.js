const { expect } = require("../test_helper");
const { VerifySlackRequest } = require("@use_cases");

describe("VerifySlackRequest", function() {
  it("can verify a slack request is legit", function() {
    const useCase = new VerifySlackRequest({
      gateway: { areSignaturesEqual: () => true }
    });
    const recentTime = new Date().getTime() / 1000 - 100;
    const response = useCase.execute({
      slackSignature: "xxx",
      timestamp: recentTime,
      body: { x: "y" }
    });
    expect(response.isVerified).to.be.true;
  });

  it("can verify a slack request is not legit if timestamp is too old", function() {
    const useCase = new VerifySlackRequest({
      gateway: { areSignaturesEqual: () => false }
    });
    const oldTime = new Date().getTime() / 1000 - 10000;
    const response = useCase.execute({ timestamp: oldTime });
    expect(response.isVerified).to.be.false;
    expect(response.error).to.be.equal("Invalid timestamp.");
  });

  it("can verify a slack request is not legit if signatures do not match", function() {
    const useCase = new VerifySlackRequest({
      gateway: { areSignaturesEqual: () => false }
    });
    const recentTime = new Date().getTime() / 1000 - 100;
    const response = useCase.execute({ timestamp: recentTime });
    expect(response.isVerified).to.be.false;
    expect(response.error).to.be.equal("Signature mismatch.");
  });
});
