const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { UpdateSlackUserLunchCycleWithReactions } = require("@use_cases");

describe("UpdateSlackUserLunchCycleWithReactions", function() {
  it("gets the correct lunch cycle from the gateway", function() {
    const lunchCycleGatewaySpy = { findById: sinon.stub().returns({ restaurants: [] }) };
    const useCase = new UpdateSlackUserLunchCycleWithReactions({
      slackUserLunchCycleGateway: { save: sinon.stub().returnsArg(0) },
      lunchCycleGateway: lunchCycleGatewaySpy
    });
    const slackUserLunchCycle = { lunchCycleId: 123 };

    useCase.execute({ slackUserLunchCycle, reactions: { message: { reactions: [] } } });

    expect(lunchCycleGatewaySpy.findById).to.have.been.calledWith(123);
  });

  it("uses the LunchCycle Restaurants list for valid reactions", function() {
    const useCase = new UpdateSlackUserLunchCycleWithReactions({
      slackUserLunchCycleGateway: { save: sinon.stub().returnsArg(0) },
      lunchCycleGateway: {
        findById: sinon.stub().returns({
          restaurants: [
            RestaurantFactory.getRestaurant({ name: "Rest 1", emoji: ":sushi:" }),
            RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":pizza:" })
          ]
        })
      }
    });
    const slackUserLunchCycle = { availableEmojis: [] };
    const reactions = {
      message: {
        reactions: [
          { name: "pizza", users: ["U2147483697"], count: 1 },
          { name: "sushi", users: ["U2147483697"], count: 1 },
          { name: "tada", users: ["U2147483697"], count: 1 }
        ]
      }
    };

    const resposne = useCase.execute({ slackUserLunchCycle, reactions });

    expect(resposne.slackUserLunchCycle.availableEmojis).to.eql([":sushi:", ":pizza:"]);
  });

  it("uses the slackUserLunchCycleGateway to save the available emojis", function() {
    const expectedSlackUserLunchCycle = { availableEmojis: [":pizza:"] };
    const slackUserLunchCycleGatewaySpy = {
      save: sinon.stub().returns(expectedSlackUserLunchCycle)
    };
    const useCase = new UpdateSlackUserLunchCycleWithReactions({
      slackUserLunchCycleGateway: slackUserLunchCycleGatewaySpy,
      lunchCycleGateway: {
        findById: sinon.stub().returns({
          restaurants: [RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":pizza:" })]
        })
      }
    });
    const slackUserLunchCycle = { availableEmojis: [] };
    const reactions = {
      message: { reactions: [{ name: "pizza", users: ["U2147483697"], count: 1 }] }
    };

    const resposne = useCase.execute({ slackUserLunchCycle, reactions });

    expect(slackUserLunchCycleGatewaySpy.save).to.have.been.calledWith(expectedSlackUserLunchCycle);

    expect(resposne.slackUserLunchCycle).to.eql(expectedSlackUserLunchCycle);
    expect(resposne.slackUserLunchCycle).to.equal(expectedSlackUserLunchCycle);
    expect(resposne.slackUserLunchCycle).to.eql(slackUserLunchCycle);
    expect(resposne.slackUserLunchCycle).to.not.equal(slackUserLunchCycle);
  });
});
