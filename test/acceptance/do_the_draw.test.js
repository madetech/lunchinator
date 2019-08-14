const { expect, config, sinon } = require("../test_helper");
const { DrawLunchers } = require("@use_cases");
const { InMemoryLunchCycleGateway, InMemorySlackUserResponseGateway } = require("@gateways");
const { LunchCycle } = require("@domain");
const { RestaurantFactory } = require("../factories");

describe("DoTheDraw", function() {
  let inMemoryLunchCycleGateway;
  let inMemorySlackUserResponseGateway;

  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
    inMemorySlackUserResponseGateway = new InMemorySlackUserResponseGateway();
  });

  const restaurants = [
    RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:", date: "01/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:", date: "02/01/2030" }),
    RestaurantFactory.getRestaurant({
      name: "restaurant3",
      emoji: ":simple_smile:",
      date: "03/01/2030"
    }),
    RestaurantFactory.getRestaurant({
      name: "restaurant4",
      emoji: ":laughing:",
      date: "04/01/2030"
    }),
    RestaurantFactory.getRestaurant({ name: "restaurant5", emoji: ":blush:", date: "05/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant6", emoji: ":relaxed:", date: "06/01/2030" })
  ];

  it("can put a luncher who has chosen the first week into the first week", async function() {
    const expected = [
      {
        firstName: "bugsbunny",
        email: "bugs@madetech.com",
        slackUserId: "bb01"
      }
    ];

    const lunchCycle = await inMemoryLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
    const luncher = await inMemorySlackUserResponseGateway.create({
      slackUser: {
        id: "bb01",
        profile: {
          email: "bugs@madetech.com",
          first_name: "bugsbunny"
        }
      },
      slackMessageResponse: {
        channel: "DM_CHANNEL_ID_1",
        ts: "1564484225.000400"
      },
      lunchCycle
    });
    await inMemorySlackUserResponseGateway.saveEmojis({ luncher, emojis: [":bowtie:"] });

    const useCase = new DrawLunchers({
      lunchCycleGateway: inMemoryLunchCycleGateway,
      slackUserResponseGateway: inMemorySlackUserResponseGateway
    });
    const response = await useCase.execute();
    expect(response.weeks[0].lunchers).to.be.eql(expected);
  });

  it("can put a luncher who has chosen only the second week into the second week", async function() {
    const expected = [
      {
        firstName: "baebunny",
        slackUserId: "bb02",
        email: "bae@madetech.com"
      }
    ];

    const lunchCycle = await inMemoryLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
    const luncher1 = await inMemorySlackUserResponseGateway.create({
      slackUser: {
        id: "bb01",
        profile: {
          email: "bugs@madetech.com",
          first_name: "bugsbunny"
        }
      },
      slackMessageResponse: {
        channel: "DM_CHANNEL_ID_1",
        ts: "1564484225.000400"
      },
      lunchCycle
    });
    await inMemorySlackUserResponseGateway.saveEmojis({ luncher: luncher1, emojis: [":bowtie:"] });
    const luncher2 = await inMemorySlackUserResponseGateway.create({
      slackUser: {
        id: "bb02",
        profile: {
          email: "bae@madetech.com",
          first_name: "baebunny"
        }
      },
      slackMessageResponse: {
        channel: "DM_CHANNEL_ID_2",
        ts: "1564484225.000600"
      },
      lunchCycle
    });
    await inMemorySlackUserResponseGateway.saveEmojis({ luncher: luncher2, emojis: [":smile:"] });

    const useCase = new DrawLunchers({
      lunchCycleGateway: inMemoryLunchCycleGateway,
      slackUserResponseGateway: inMemorySlackUserResponseGateway
    });
    const response = await useCase.execute();

    expect(response.weeks[1].lunchers).to.be.eql(expected);
  });

  it("can prioritise a luncher with less availablity", async function() {
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 1);

    const lunchCycle = await inMemoryLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
    const luncher1 = await inMemorySlackUserResponseGateway.create({
      slackUser: {
        id: "bb01",
        profile: {
          email: "bugs@madetech.com",
          first_name: "bugsbunny"
        }
      },
      slackMessageResponse: {
        channel: "DM_CHANNEL_ID_1",
        ts: "1564484225.000400"
      },
      lunchCycle
    });
    await inMemorySlackUserResponseGateway.saveEmojis({
      luncher: luncher1,
      emojis: [":bowtie:", ":smile:"]
    });
    const luncher2 = await inMemorySlackUserResponseGateway.create({
      slackUser: {
        id: "bb02",
        profile: {
          email: "bae@madetech.com",
          first_name: "baebunny"
        }
      },
      slackMessageResponse: {
        channel: "DM_CHANNEL_ID_2",
        ts: "1564484225.000600"
      },
      lunchCycle
    });
    await inMemorySlackUserResponseGateway.saveEmojis({ luncher: luncher2, emojis: [":bowtie:"] });

    const useCase = new DrawLunchers({
      lunchCycleGateway: inMemoryLunchCycleGateway,
      slackUserResponseGateway: inMemorySlackUserResponseGateway
    });

    const response = await useCase.execute();

    expect(response.weeks[0].lunchers[0].firstName).to.be.eql("baebunny");
    expect(response.weeks[1].lunchers[0].firstName).to.be.eql("bugsbunny");
  });
});
