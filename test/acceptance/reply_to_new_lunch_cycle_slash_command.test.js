const { expect } = require("../test_helper");
const { SendLunchCyclePreview } = require("@use_cases");

class FakeSlackGateway {
  sendMessage(slackMessage) {
    return true;
  }
}

describe("Acceptance Test can reply to new lunch cycle slash command", function() {
  xit("can send a preview message", function() {
    ThenALunchCyclePreviewIsSent();
  });
});

function ThenALunchCyclePreviewIsSent() {
  var fakeSlackGateway = new FakeSlackGateway();
  var useCase = new SendLunchCyclePreview({ gateway: fakeSlackGateway });
  var response = useCase.execute();
  expect(response.slackResponse).to.be.true;
}
