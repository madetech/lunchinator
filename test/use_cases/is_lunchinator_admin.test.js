const { expect, sinon, config } = require("../test_helper");
const { IsLunchinatorAdmin } = require("@use_cases");

describe("IsLunchinatorAdmin", function() {
  it("check lunchinator user is valid", function() {
    const useCase = new IsLunchinatorAdmin();

    expect(useCase.execute({ userId: config.VALID_SLACK_USER_IDS[0] }).isValid).to.be.true;
  });

  it("returns false if there are no valid Slack users", function() {
    const userId = Object.assign({}, config).VALID_SLACK_USER_IDS[0];
    const useCase = new IsLunchinatorAdmin();

    sinon.stub(config, "VALID_SLACK_USER_IDS").get(() => []);
    expect(useCase.execute({ userId: userId }).isValid).to.be.false;
  });

  it("returns false if it is not a valid Slack user", function() {
    const useCase = new IsLunchinatorAdmin();

    expect(useCase.execute({ userId: "BogusID" }).isValid).to.be.false;
  });
});
