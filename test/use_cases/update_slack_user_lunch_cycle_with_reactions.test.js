const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { UpdateSlackUserLunchCycleWithReactions } = require("@use_cases");

describe("UpdateSlackUserLunchCycleWithReactions", function() {
  it("gets the correct lunch cycle from the gateway", async function() {
    const lunchCycleGatewaySpy = { findById: sinon.stub().returns({ restaurants: [] }) };
    const slackUserLunchCycle = { lunchCycleId: 123 };
    const useCase = new UpdateSlackUserLunchCycleWithReactions({
      slackUserLunchCycleGateway: { save: sinon.stub().resolves(slackUserLunchCycle) },
      lunchCycleGateway: lunchCycleGatewaySpy
    });

    await useCase.execute({ slackUserLunchCycle, reactions: { message: { reactions: [] } } });

    expect(lunchCycleGatewaySpy.findById).to.have.been.calledWith(123);
  });

  it("uses the LunchCycle Restaurants list for valid reactions", async function() {
    const slackUserLunchCycle = { availableEmojis: [] };
    const useCase = new UpdateSlackUserLunchCycleWithReactions({
      slackUserLunchCycleGateway: {
        save: sinon.stub().resolves(slackUserLunchCycle)
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

    const resposne = await useCase.execute({ slackUserLunchCycle, reactions });

    expect(resposne.slackUserLunchCycle.availableEmojis).to.eql([":sushi:", ":pizza:"]);
  });

  it("uses the slackUserLunchCycleGateway to save the available emojis", async function() {
    const slackUserLunchCycle = { availableEmojis: [] };
    const slackUserLunchCycleGatewaySpy = {
      save: sinon.stub().resolves()
    };
    const useCase = new UpdateSlackUserLunchCycleWithReactions({
      slackUserLunchCycleGateway: slackUserLunchCycleGatewaySpy,
      lunchCycleGateway: {
        findById: sinon.stub().returns({
          restaurants: [RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":pizza:" })]
        })
      }
    });
    const reactions = {
      message: { reactions: [{ name: "pizza", users: ["U2147483697"], count: 1 }] }
    };

    await useCase.execute({ slackUserLunchCycle, reactions });

    expect(slackUserLunchCycleGatewaySpy.save).to.have.been.calledWith({ slackUserLunchCycle });
  });
});
