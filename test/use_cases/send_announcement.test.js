const { expect, sinon } = require("../test_helper");
const { SendAnnouncement } = require("@use_cases");
const { LunchCycleWeek, Restaurant, Luncher } = require("@domain");
const config = require("@app/config");

describe("SendAnnouncement", function() {
  it("can the lunchers on the announcements channel", async function() {
    const announcemntsChannel = sinon.stub(config, "ANNOUNCEMENTS_CHANNEL").get(() => "test");
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

    const gatewaySpy = { sendMessageWithText: sinon.fake.returns(true) };
    const announcementsMessageDummy = { text: "" };
    const generateAnnouncementsMessage = { execute: sinon.fake.returns(announcementsMessageDummy) };
    const useCase = new SendAnnouncement({
      slackGateway: gatewaySpy,
      generateAnnouncementsMessage: generateAnnouncementsMessage
    });
    const response = await useCase.execute({ lunchCycleWeekStub });

    expect(gatewaySpy.sendMessageWithText).to.have.been.calledWith(
      "test",
      announcementsMessageDummy
    );
    expect(response).to.eql(true);
  });
});
