const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { UpdateSlackUserResponseWithReactions } = require("@use_cases");

describe("UpdateSlackUserResponseWithReactions", function() {
  it("gets the correct lunch cycle from the gateway", async function() {
    const lunchCycleGatewaySpy = { findById: sinon.stub().returns({ restaurants: [] }) };
    const slackUserResponse = { lunchCycleId: 123 };
    const useCase = new UpdateSlackUserResponseWithReactions({
      slackUserResponseGateway: { save: sinon.stub().resolves(slackUserResponse) },
      lunchCycleGateway: lunchCycleGatewaySpy
    });

    await useCase.execute({ slackUserResponse, reactions: { message: { reactions: [] } } });

    expect(lunchCycleGatewaySpy.findById).to.have.been.calledWith(123);
  });

  it("uses the LunchCycle Restaurants list for valid reactions", async function() {
    const slackUserResponse = { availableEmojis: [] };
    const useCase = new UpdateSlackUserResponseWithReactions({
      slackUserResponseGateway: {
        save: sinon.stub().resolves(slackUserResponse)
      },
      lunchCycleGateway: {
        findById: sinon.stub().returns({
          restaurants: [
            RestaurantFactory.getRestaurant({ name: "Rest 1", emoji: ":sushi:" }),
            RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":pizza:" })
          ]
        })
      }
    });
    const reactions = {
      message: {
        reactions: [
          { name: "pizza", users: ["U2147483697"], count: 1 },
          { name: "sushi", users: ["U2147483697"], count: 1 },
          { name: "tada", users: ["U2147483697"], count: 1 }
        ]
      }
    };

    const resposne = await useCase.execute({ slackUserResponse, reactions });

    expect(resposne.slackUserResponse.availableEmojis).to.eql([":sushi:", ":pizza:"]);
  });

  it("uses the slackUserResponseGateway to save the available emojis", async function() {
    const slackUserResponse = { availableEmojis: [] };
    const slackUserResponseGatewaySpy = {
      save: sinon.stub().resolves()
    };
    const useCase = new UpdateSlackUserResponseWithReactions({
      slackUserResponseGateway: slackUserResponseGatewaySpy,
      lunchCycleGateway: {
        findById: sinon.stub().returns({
          restaurants: [RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":pizza:" })]
        })
      }
    });
    const reactions = {
      message: { reactions: [{ name: "pizza", users: ["U2147483697"], count: 1 }] }
    };

    await useCase.execute({ slackUserResponse, reactions });

    expect(slackUserResponseGatewaySpy.save).to.have.been.calledWith({ slackUserResponse });
  });
});
