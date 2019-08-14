const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { UpdateLuncherReactions } = require("@use_cases");

describe("UpdateLuncherReactions", function() {
  it("uses the LunchCycle Restaurants list for valid reactions", async function() {
    const luncher = { availableEmojis: [":sushi:", ":pizza:"] };
    const useCase = new UpdateLuncherReactions({
      slackUserResponseGateway: {
        saveEmojis: sinon.stub().resolves(luncher)
      },
      lunchCycleGateway: {
        getCurrent: sinon.stub().returns({
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

    const response = await useCase.execute({ luncher, reactions });
    expect(response.updatedLuncher.availableEmojis).to.eql(luncher.availableEmojis);
  });

  it("uses the slackUserResponseGateway to save the available emojis", async function() {
    const luncher = { availableEmojis: [] };
    const slackUserResponseGatewaySpy = {
      saveEmojis: sinon.stub().resolves()
    };
    const useCase = new UpdateLuncherReactions({
      slackUserResponseGateway: slackUserResponseGatewaySpy,
      lunchCycleGateway: {
        getCurrent: sinon.stub().returns({
          restaurants: [RestaurantFactory.getRestaurant({ name: "Rest 2", emoji: ":pizza:" })]
        })
      }
    });
    const reactions = {
      message: { reactions: [{ name: "pizza", users: ["U2147483697"], count: 1 }] }
    };

    await useCase.execute({ luncher, reactions });

    expect(slackUserResponseGatewaySpy.saveEmojis).to.have.been.calledWith({
      luncher,
      emojis: [":pizza:"]
    });
  });
});
