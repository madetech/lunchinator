const { expect, sinon } = require("../test_helper");
const { SendMessageToSelectedLunchers, GenerateLunchersMessage } = require("@use_cases");
const { LunchCycleWeek, Restaurant, Luncher } = require("../../app/domain");

describe("SendMessageToSelectedLunchers", function() {
  it("can send messages to a selected luncher", async function() {
    class SlackGatewayFake {
      sendMessageWithText(slackUserId, slackMessage) {
        return true;
      }
    }

    const slackGatewayFake = new SlackGatewayFake();
    sinon.spy(slackGatewayFake, "sendMessageWithText");
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
        })
      ],
      allAvailable: []
    });

    const generateSelectedLunchersMessageFake = {
      execute: sinon.fake.returns({ text: "message 1" })
    };

    const useCase = new SendMessageToSelectedLunchers({
      slackGateway: slackGatewayFake,
      generateSelectedLunchersMessage: generateSelectedLunchersMessageFake
    });
    const response = await useCase.execute({ lunchCycleWeek: lunchCycleWeekStub });

    expect(slackGatewayFake.sendMessageWithText).to.have.been.calledWith({
      slackUserId: lunchCycleWeekStub.lunchers[0].slackUserId,
      message: { text: "message 1" }
    });
    expect(response[0].slackMessageResponse).to.eql(true);
  });

  // it("can send messages to multiple selected lunchers", async function() {
  //   class SlackGatewayFake {
  //     sendMessageWithText(slackUserId, slackMessage) {
  //       return true;
  //     }
  //   }

  //   const slackGatewayFake = new SlackGatewayFake();
  //   sinon.spy(slackGatewayFake, "sendMessageWithText");
  //   const lunchCycleWeekStub = new LunchCycleWeek({
  //     restaurant: new Restaurant({
  //       name: "Camino",
  //       direction: "https://goo.gl/maps/TMVtpYXrLxYhKr5DA",
  //       date: "30/08/2019"
  //     }),
  //     lunchers: [
  //       new Luncher({
  //         slackUserId: "slackUserID1",
  //         email: "email1",
  //         firstName: "name1"
  //       }),
  //       new Luncher({
  //         slackUserId: "slackUserID2",
  //         email: "email2",
  //         firstName: "name2"
  //       })
  //     ],
  //     allAvailable: []
  //   });

  //   const generateSelectedLunchersMessage = new GenerateLunchersMessage();

  //   const useCase = new SendMessageToSelectedLunchers({
  //     slackGateway: slackGatewayFake,
  //     generateSelectedLunchersMessage: generateSelectedLunchersMessage
  //   });
  //   const response = await useCase.execute({ lunchCycleWeek: lunchCycleWeekStub });

  //   expect(slackGatewayFake.sendMessageWithText).to.have.been.calledWith({
  //     slackUserId: lunchCycleWeekStub.lunchers[1].slackUserId,
  //     message: { text: "message 2" }
  //   });
  //   expect(response[0].slackMessageResponse).to.eql(true);
  // });
});
