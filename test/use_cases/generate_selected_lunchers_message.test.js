const { expect, sinon } = require("../test_helper");
const { GenerateSelectedLunchersMessage } = require("@use_cases");
const { LunchCycleWeek, Restaurant, Luncher } = require("../../app/domain");

describe.only("GenerateSelectedLunchersMessage", function() {
  it("can generate a slack message for selected luncher", function() {
    const lunchCycleWeekStub = new LunchCycleWeek({
      restaurant: new Restaurant({
        name: "Camino",
        direction: "https://goo.gl/maps/TMVtpYXrLxYhKr5DA",
        date: "30/08/2019"
      }),
      lunchers: [
        new Luncher({
          slackUserId: "slackUserID1",
          email: "email1",
          firstName: "name1"
        }),
        new Luncher({
          slackUserId: "slackUserID2",
          email: "email2",
          firstName: "name2"
        })
      ],
      allAvailable: []
    });
    const luncherStub = new Luncher({
      slackUserId: "slackUserID1",
      email: "email1",
      firstName: "name1"
    });

    const expected = `Congratulations \<\@${"slackUserID1"}\>, you have been selected to join the lunchers on \*30/08/2019\*!.\n You will be going to Camino along with:\n \<\@${"slackUserID2"}\>`;
    const useCase = new GenerateSelectedLunchersMessage();
    const response = useCase.execute({ lunchCycleWeek: lunchCycleWeekStub, luncher: luncherStub });
    expect(response.text).to.be.eql(expected);
  });
});
