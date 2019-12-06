const { expect, config, sinon, clearPostgres } = require("../test_helper");
const { DrawLunchers } = require("@use_cases");
const { PostgresLunchCycleGateway, PostgresLuncherAvailabilityGateway, PostgresSlackUserResponseGateway } = require("@gateways");
const { LunchCycle } = require("@domain");
const { RestaurantFactory } = require("../factories");

describe("DoTheDraw", function() {
  let postgresLunchCycleGateway;
  let postgresLuncherAvailabilityGateway;
  let postgresSlackUserResponseGateway;

  const slackUsers = [
    {
      id: "bb01",
      profile: {
        email: "bugs@madetech.com",
        first_name: "bugsbunny"
      }
    },
    {
      id: "bb02",
      profile: {
        email: "bae@madetech.com",
        first_name: "baebunny"
      }
    },
    {
      id: "bb03",
      profile: {
        email: "b3@madetech.com",
        first_name: "b3"
      }
    },
    {
      id: "bb04",
      profile: {
        email: "b4@madetech.com",
        first_name: "b4"
      }
    },
    {
      id: "bb05",
      profile: {
        email: "b5@madetech.com",
        first_name: "b5"
      }
    },
    {
      id: "bb06",
      profile: {
        email: "b6@madetech.com",
        first_name: "b6"
      }
    },
    {
      id: "bb07",
      profile: {
        email: "b7@madetech.com",
        first_name: "b7"
      }
    },
    {
      id: "bb08",
      profile: {
        email: "b8@madetech.com",
        first_name: "b8"
      }
    },
    {
      id: "bb09",
      profile: {
        email: "b9@madetech.com",
        first_name: "b9"
      }
    }
  ];

  beforeEach(async function() {
    postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    postgresLuncherAvailabilityGateway = new PostgresLuncherAvailabilityGateway(config.db);
    postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway()
    await clearPostgres();
  });

  const restaurants = [
    RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:", date: "01/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:", date: "02/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":simple_smile:", date: "03/01/2030"})
  ];

  xit("can put a luncher who has chosen the first week into the first week", async function() {
    const expected = [
      {
        firstName: "bugsbunny",
        email: "bugs@madetech.com",
        slackUserId: "bb01"
      }
    ];

    const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
   
    const luncher = await postgresLuncherAvailabilityGateway.create({
      slackUser: slackUsers[0],
      slackMessageResponse: {},
      lunchCycle
    });
    await postgresLuncherAvailabilityGateway.saveEmojis({ luncher, emojis: [":bowtie:"] });
    

    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      slackUserResponseGateway: postgresSlackUserResponseGateway
    });
    const response = await useCase.execute();
    expect(response.lunchCycleDraw[0].lunchers).to.be.eql(expected);
  });

  xit("can put a luncher who has chosen only the second week into the second week", async function() {
    const expected = [
      {
        firstName: "baebunny",
        slackUserId: "bb02",
        email: "bae@madetech.com"
      }
    ];

    const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
    const luncher1 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[0],
      slackMessageResponse: {},
      lunchCycle
    });
    await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher1, emojis: [":bowtie:"] });
    const luncher2 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[1],
      slackMessageResponse: {},
      lunchCycle
    });
    await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher2, emojis: [":smile:"] });

    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      slackUserResponseGateway: postgresSlackUserResponseGateway
    });
    const response = await useCase.execute();

    expect(response.lunchCycleDraw[1].lunchers).to.be.eql(expected);
  });

  xit("can prioritise a luncher with less availablity", async function() {
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 1);

    const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
    const luncher1 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[0],
      slackMessageResponse: {},
      lunchCycle
    });
    await postgresSlackUserResponseGateway.saveEmojis({
      luncher: luncher1,
      emojis: [":bowtie:", ":smile:"]
    });
    const luncher2 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[1],
      slackMessageResponse: {},
      lunchCycle
    });
    await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher2, emojis: [":bowtie:"] });

    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      slackUserResponseGateway: postgresSlackUserResponseGateway
    });

    const response = await useCase.execute();

    expect(response.lunchCycleDraw[0].lunchers[0].firstName).to.be.eql("baebunny");
    expect(response.lunchCycleDraw[1].lunchers[0].firstName).to.be.eql("bugsbunny");
  });

  xit("can do a draw for 9 lunchers over 3 weeks", async function() {
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 3);

    const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );

    const luncher1 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[0],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher2 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[1],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher3 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[2],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher4 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[3],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher5 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[4],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher6 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[5],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher7 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[6],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher8 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[7],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher9 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[8],
      slackMessageResponse: {},
      lunchCycle
    });
    await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher1, emojis: [":bowtie:"] });
    await postgresSlackUserResponseGateway.saveEmojis({
      luncher: luncher2,
      emojis: [":bowtie:", ":smile:"]
    });
    await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher3, emojis: [":smile:"] });
    await postgresSlackUserResponseGateway.saveEmojis({
      luncher: luncher4,
      emojis: [":simple_smile:"]
    });
    await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher5, emojis: [":bowtie:"] });
    await postgresSlackUserResponseGateway.saveEmojis({
      luncher: luncher6,
      emojis: [":bowtie:", ":smile:", ":simple_smile:"]
    });
    await postgresSlackUserResponseGateway.saveEmojis({
      luncher: luncher7,
      emojis: [":simple_smile:", ":smile:"]
    });
    await postgresSlackUserResponseGateway.saveEmojis({
      luncher: luncher8,
      emojis: [":bowtie:", ":smile:"]
    });
    await postgresSlackUserResponseGateway.saveEmojis({
      luncher: luncher9,
      emojis: [":simple_smile:", ":bowtie:"]
    });

    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      slackUserResponseGateway: postgresSlackUserResponseGateway
    });

    const response = await useCase.execute();

    const w1 = response.lunchCycleDraw[0].lunchers;
    const w2 = response.lunchCycleDraw[1].lunchers;
    const w3 = response.lunchCycleDraw[2].lunchers;

    expect(w1.length).to.eql(3);
    expect(w2.length).to.eql(3);
    expect(w3.length).to.eql(3);

    const allTheLunchers = w1.concat(w2, w3).map(l => l.firstName);
    const allTheLunchersWithoutDuplicates = new Set(allTheLunchers);

    expect(allTheLunchersWithoutDuplicates.size).to.eql(9);
  });

  xit("can do the draw and set lunchers avalabilities for each week", async function() {
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 3);

     const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants :restaurants
      })
    );

    const luncher1 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[0],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher2 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[1],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher3 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[2],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher4 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[3],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher5 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[4],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher6 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[5],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher7 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[6],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher8 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[7],
      slackMessageResponse: {},
      lunchCycle
    });
    const luncher9 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[8],
      slackMessageResponse: {},
      lunchCycle
    });

    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher2.slackUserId, restaurant_name: restaurants[0]})
    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher2.slackUserId, restaurant_name: restaurants[1]})

    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher4.slackUserId, restaurant_name: restaurants[2]})

    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher6.slackUserId, restaurant_name: restaurants[0]})
    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher6.slackUserId, restaurant_name: restaurants[1]})
    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher6.slackUserId, restaurant_name: restaurants[2]})

    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher7.slackUserId, restaurant_name: restaurants[1]})
    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher7.slackUserId, restaurant_name: restaurants[2]})

    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher8.slackUserId, restaurant_name: restaurants[0]})
    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher8.slackUserId, restaurant_name: restaurants[1]})

    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher9.slackUserId, restaurant_name: restaurants[0]})
    await postgresLuncherAvailabilityGateway.addAvailability({lunch_cycle_id: lunchCycle.id, slack_user_id: luncher9.slackUserId, restaurant_name: restaurants[2]})
    
    // await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher1, emojis: [":bowtie:"] });
    // await postgresSlackUserResponseGateway.saveEmojis({
    //   luncher: luncher2,
    //   emojis: [":bowtie:", ":smile:"]
    // });
    // await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher3, emojis: [":smile:"] });
    // await postgresSlackUserResponseGateway.saveEmojis({
    //   luncher: luncher4,
    //   emojis: [":simple_smile:"]
    // });
    // await postgresSlackUserResponseGateway.saveEmojis({ luncher: luncher5, emojis: [":bowtie:"] });
    // await postgresSlackUserResponseGateway.saveEmojis({
    //   luncher: luncher6,
    //   emojis: [":bowtie:", ":smile:", ":simple_smile:"]
    // });
    // await postgresSlackUserResponseGateway.saveEmojis({
    //   luncher: luncher7,
    //   emojis: [":simple_smile:", ":smile:"]
    // });
    // await postgresSlackUserResponseGateway.saveEmojis({
    //   luncher: luncher8,
    //   emojis: [":bowtie:", ":smile:"]
    // });
    // await postgresSlackUserResponseGateway.saveEmojis({
    //   luncher: luncher9,
    //   emojis: [":simple_smile:", ":bowtie:"]
    // });

    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      postgresLuncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    });

    const response = await useCase.execute();
    expect(response.lunchCycleDraw[0].allAvailable).to.be.eql([
      luncher1,
      luncher2,
      luncher5,
      luncher6,
      luncher8,
      luncher9
    ]);
    expect(response.lunchCycleDraw[1].allAvailable).to.be.eql([
      luncher2,
      luncher3,
      luncher6,
      luncher7,
      luncher8
    ]);
    expect(response.lunchCycleDraw[2].allAvailable).to.be.eql([
      luncher4,
      luncher6,
      luncher7,
      luncher9
    ]);
  });
});
