const { expect, config, sinon, clearPostgres } = require("../test_helper");
const { DrawLunchers } = require("@use_cases");
const {
  PostgresLunchCycleGateway,
  PostgresLuncherAvailabilityGateway,
  PostgresSlackUserResponseGateway
} = require("@gateways");
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
        real_name: "bugsbunny"
      }
    },
    {
      id: "bb02",
      profile: {
        email: "bae@madetech.com",
        real_name: "baebunny"
      }
    },
    {
      id: "bb03",
      profile: {
        email: "b3@madetech.com",
        real_name: "b3"
      }
    },
    {
      id: "bb04",
      profile: {
        email: "b4@madetech.com",
        real_name: "b4"
      }
    },
    {
      id: "bb05",
      profile: {
        email: "b5@madetech.com",
        real_name: "b5"
      }
    },
    {
      id: "bb06",
      profile: {
        email: "b6@madetech.com",
        real_name: "b6"
      }
    },
    {
      id: "bb07",
      profile: {
        email: "b7@madetech.com",
        real_name: "b7"
      }
    },
    {
      id: "bb08",
      profile: {
        email: "b8@madetech.com",
        real_name: "b8"
      }
    },
    {
      id: "bb09",
      profile: {
        email: "b9@madetech.com",
        real_name: "b9"
      }
    }
  ];

  beforeEach(async function() {
    postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    postgresLuncherAvailabilityGateway = new PostgresLuncherAvailabilityGateway(config.db);
    postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();
    await clearPostgres();
  });

  const restaurants = [
    RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:", date: "01/01/2030" }),
    RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:", date: "02/01/2030" }),
    RestaurantFactory.getRestaurant({
      name: "restaurant3",
      emoji: ":simple_smile:",
      date: "03/01/2030"
    })
  ];

  it("can put a luncher who has chosen the first week into the first week", async function() {
    const expected = [
      {
        realName: "bugsbunny",
        email: "bugs@madetech.com",
        slackUserId: "bb01"
      }
    ];

    const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
    await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[0],
      slackMessageResponse: {},
      lunchCycle
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: slackUsers[0].id,
      restaurant_name: restaurants[0].name,
      available: true
    });

    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      postgresLuncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    });
    const response = await useCase.execute();
    expect(response.lunchCycleDraw[0].lunchers).to.be.eql(expected);
  });

  it("can put a luncher who has chosen only the second week into the second week", async function() {
    const expected = [
      {
        realName: "baebunny",
        slackUserId: "bb02",
        email: "bae@madetech.com"
      }
    ];

    const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );
    
    await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[0],
      slackMessageResponse: {},
      lunchCycle
    });
    
    await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[1],
      slackMessageResponse: {},
      lunchCycle
    });
    
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: slackUsers[0].id,
      restaurant_name: restaurants[0].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: slackUsers[1].id,
      restaurant_name: restaurants[1].name,
      available: true
    });
    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      postgresLuncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    });
    const response = await useCase.execute();
    expect(response.lunchCycleDraw[1].lunchers).to.be.eql(expected);
  });

  it("can prioritise a luncher with less availablity", async function() {
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
    const luncher2 = await postgresSlackUserResponseGateway.create({
      slackUser: slackUsers[1],
      slackMessageResponse: {},
      lunchCycle
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: slackUsers[0].id,
      restaurant_name: restaurants[0].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: slackUsers[0].id,
      restaurant_name: restaurants[1].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: slackUsers[1].id,
      restaurant_name: restaurants[1].name,
      available: true
    });
    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      postgresLuncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    });
    const response = await useCase.execute();

    expect(response.lunchCycleDraw[0].lunchers[0]).to.be.eql(userObject(luncher1));
    expect(response.lunchCycleDraw[1].lunchers[0]).to.be.eql(userObject(luncher2));
  });

  it("can do the draw and set lunchers avalabilities for each week", async function() {
    sinon.stub(config, "LUNCHERS_PER_WEEK").get(() => 3);

    const lunchCycle = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: restaurants
      })
    );

    const [
      luncher1,
      luncher2,
      luncher3,
      luncher4,
      luncher5,
      luncher6,
      luncher7,
      luncher8,
      luncher9
    ] = await createUsers(lunchCycle, slackUsers);

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher1.slackUserId,
      restaurant_name: restaurants[0].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher2.slackUserId,
      restaurant_name: restaurants[0].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher3.slackUserId,
      restaurant_name: restaurants[0].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher3.slackUserId,
      restaurant_name: restaurants[1].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher4.slackUserId,
      restaurant_name: restaurants[1].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher5.slackUserId,
      restaurant_name: restaurants[1].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher6.slackUserId,
      restaurant_name: restaurants[1].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher7.slackUserId,
      restaurant_name: restaurants[1].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher7.slackUserId,
      restaurant_name: restaurants[2].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher8.slackUserId,
      restaurant_name: restaurants[0].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher8.slackUserId,
      restaurant_name: restaurants[1].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher8.slackUserId,
      restaurant_name: restaurants[2].name,
      available: true
    });

    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher9.slackUserId,
      restaurant_name: restaurants[0].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher9.slackUserId,
      restaurant_name: restaurants[1].name,
      available: true
    });
    await postgresLuncherAvailabilityGateway.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: luncher9.slackUserId,
      restaurant_name: restaurants[2].name,
      available: true
    });

    const useCase = new DrawLunchers({
      lunchCycleGateway: postgresLunchCycleGateway,
      postgresLuncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    });

    const response = await useCase.execute();
    expect(response.lunchCycleDraw[0].lunchers).to.eql([
      userObject(luncher1),
      userObject(luncher2),
      userObject(luncher3)
    ]);
    expect(response.lunchCycleDraw[1].lunchers).to.eql([
      userObject(luncher4),
      userObject(luncher5),
      userObject(luncher6)
    ]);
    expect(response.lunchCycleDraw[2].lunchers).to.eql([
      userObject(luncher7),
      userObject(luncher8),
      userObject(luncher9)
    ]);
  });

  async function createUsers(lunchCycle, users_array) {
    created_users_array = [];

    for (user of users_array) {
      const new_user = await postgresSlackUserResponseGateway.create({
        slackUser: user,
        slackMessageResponse: {},
        lunchCycle
      });
      created_users_array.push(new_user);
    }

    return created_users_array;
  }
});

function userObject(luncher) {
  return {
    realName: luncher.realName,
    email: luncher.email,
    slackUserId: luncher.slackUserId
  };
}
