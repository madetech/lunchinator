const { expect, sinon } = require("../test_helper");
const { GenerateReminderMessage } = require("@use_cases");

describe("GenerateReminderMessage", function() {
  it("can generate a reminder message for a slack user", function() {
    const nonResponderId = "slackUserId";
    const expectedResponse = `Hi <@slackUserId>, please respond with your preferences for the lunchers draw!`;
    const useCase = new GenerateReminderMessage();
    const response = useCase.execute({ nonResponderId });
    expect(response.text).to.eql(expectedResponse);
  });
});
