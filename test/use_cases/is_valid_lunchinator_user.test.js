const { expect } = require("../test_helper");
const IsValidLunchinatorUser = require("@use_cases/is_valid_lunchinator_user");

describe("IsValidLunchinatorUser", function() {
  it("check lunchinator user is valid", function() {
    var useCase = new IsValidLunchinatorUser({ user_id: "U2147483697" });

    var isValid = useCase.execute();

    expect(isValid).to.be.true;
  });
});
