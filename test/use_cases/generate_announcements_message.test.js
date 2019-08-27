const { expect, sinon } = require("../test_helper");
const { GenerateAnnouncementsMessage } = require("@use_cases");
const { LunchCycleWeek, Restaurant, Luncher } = require("../../app/domain");

describe("GenerateAnnouncementsMessage", function() {
  it("can generate a message to be sent on the announcements channel", function() {
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

    const expected = `Today, lunchers will be going to \*Camino\*. Here is a list of todays lunchers: \n \<\@${"slackUserID1"}\>,\n \<\@${"slackUserID2"}\>`;
    const useCase = new GenerateAnnouncementsMessage();
    const response = useCase.execute({ lunchCycleWeek: lunchCycleWeekStub });
    expect(response.text).to.be.eql(expected);
  });
});
