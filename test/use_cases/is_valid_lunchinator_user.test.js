const { expect, sinon, config } = require("../test_helper");
const IsValidLunchinatorUser = require("@use_cases/is_valid_lunchinator_user");

describe("IsValidLunchinatorUser", function() {
  it("check lunchinator user is valid", function() {
    const useCase = new IsValidLunchinatorUser({ user_id: config.VALID_SLACK_USER_IDS[0] });

    expect(useCase.execute().isValid).to.be.true;
  });

  it("returns false if there are no valid Slack users", function() {
    const userId = Object.assign({}, config).VALID_SLACK_USER_IDS[0];
    const useCase = new IsValidLunchinatorUser({ user_id: userId });

    sinon.stub(config, "VALID_SLACK_USER_IDS").get(() => []);
    expect(useCase.execute().isValid).to.be.false;
  });

  it("returns false if it is not a valid Slack user", function() {
    const useCase = new IsValidLunchinatorUser({ user_id: "BogusID" });

    expect(useCase.execute().isValid).to.be.false;
  });
});
