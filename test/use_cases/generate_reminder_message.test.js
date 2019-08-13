const { expect, sinon } = require("../test_helper");
const { GenerateReminderMessage } = require("@use_cases");

describe("GenerateReminderMessage", function() {
  it("can generate a reminder message for a slack user", function() {
    const slackUserId = "slackUserId";
    const expectedResponse = `Hi <@slackUserId>, please respond with your prefrences for the lunchers draw!`;
    const useCase = new GenerateReminderMessage();
    const response = useCase.execute({ slackUserId });
    expect(response.text).to.eql(expectedResponse);
  });
});
