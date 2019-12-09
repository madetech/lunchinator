const { expect, sinon, config } = require("../test_helper");
const { DrawLunchers } = require("@use_cases");
const { LunchCycle, Luncher } = require("@domain");
const { RestaurantFactory } = require("../factories");

describe("DrawLunchers", function() {
  const restaurants = [
    RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:", date: "01/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:", date: "02/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:", date: "03/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant4", emoji: ":laughing:", date: "04/01/2030"}),
    RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:", date: "05/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:", date: "06/01/2030" })
  ];

  it("can put a luncher who has chosen only the second week into the second week", async function() {
    const expected = [
      {
        firstName: "baebunny",
        email: "bae@madetech.com",
        slackUserId: "bb02"
      }
    ];

    const useCase = new DrawLunchers({
      lunchCycleGateway: {
        getCurrent: sinon.fake.resolves(new LunchCycle({ restaurants: restaurants }))
      },
      postgresLuncherAvailabilityGateway: {
        getAvailableUsers: sinon.fake.resolves([
          {
            slackUserId: "bb01",
            lunchCycleId: 1,
            firstName: "bugsbunny",
            restaurantName: "restaurant1",
            email: 'bugs@madetech.com'
          },
          {
            slackUserId: "bb02",
            lunchCycleId: 1,
            firstName: "baebunny",
            restaurantName: "restaurant2",
            email: "bae@madetech.com"
          }
        ])
      }
    });

    const response = await useCase.execute();

    expect(response.lunchCycleDraw[1].lunchers).to.be.eql(expected);
  });

  it("can prioritise a luncher with less availablity, for two lunchers", async function() {
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 1);
    const useCase = new DrawLunchers({
      lunchCycleGateway: {
        getCurrent: sinon.fake.resolves(new LunchCycle({ restaurants: restaurants }))
      },
      postgresLuncherAvailabilityGateway: {
        getAvailableUsers: sinon.fake.resolves([
            {
            slackUserId: "bb01",
            lunchCycleId: 1,
            firstName: "bugsbunny",
            restaurantName: "restaurant1",
            email: 'bugs@madetech.com',
          },
          {
            slackUserId: "bb01",
            lunchCycleId: 1,
            firstName: "bugsbunny",
            restaurantName: "restaurant2",
            email: 'bugs@madetech.com',
          },
          {
            slackUserId: "bb02",
            lunchCycleId: 1,
            firstName: "baebunny",
            restaurantName: "restaurant1",
            email: "bae@madetech.com",
          }
        ])
      }
    });

    const response = await useCase.execute();

    expect(response.lunchCycleDraw[0].lunchers[0].firstName).to.be.eql("baebunny");
    expect(response.lunchCycleDraw[1].lunchers[0].firstName).to.be.eql("bugsbunny");
    expect(response.lunchCycleDraw[0].lunchers.length).to.be.eql(1);
  });
  
  it("can put a luncher who has chosen the first week into the first week", async function() {
    const expected = [
      {
        firstName: "bugsbunny",
        email: "bugs@madetech.com",
        slackUserId: "bb01"
      },
    ];

    const useCase = new DrawLunchers({
      lunchCycleGateway: {
        getCurrent: sinon.fake.resolves(new LunchCycle({ restaurants: restaurants }))
      },
      postgresLuncherAvailabilityGateway: {
        getAvailableUsers: sinon.fake.resolves([
          {
            slackUserId: "bb01",
            lunchCycleId: 1,
            firstName: "bugsbunny",
            restaurantName: "restaurant1",
            email: 'bugs@madetech.com'
          }
        ])
      }
    });
    const response = await useCase.execute();

    expect(response.lunchCycleDraw[0].lunchers).to.be.eql(expected);
  });
  
  it("can check luncher is available for two different restaurants in the one lunch cycle", async function() {
    const expected = [
      {
        firstName: "bugsbunny",
        email: "bugs@madetech.com",
        slackUserId: "bb01"
      },
    ];

    const useCase = new DrawLunchers({
      lunchCycleGateway: {
        getCurrent: sinon.fake.resolves(new LunchCycle({ restaurants: restaurants }))
      },
      postgresLuncherAvailabilityGateway: {
        getAvailableUsers: sinon.fake.resolves([
          {
            slackUserId: "bb01",
            lunchCycleId: 1,
            firstName: "bugsbunny",
            restaurantName: "restaurant1",
            email: 'bugs@madetech.com'
          },
          {
            slackUserId: "bb01",
            lunchCycleId: 1,
            firstName: "bugsbunny",
            restaurantName: "restaurant2",
            email: 'bugs@madetech.com'
          },
        ])
      }
    });
    const response = await useCase.execute();

    expect(response.lunchCycleDraw[0].lunchers).to.be.eql(expected);
  });
});
