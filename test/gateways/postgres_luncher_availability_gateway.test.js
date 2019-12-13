const { expect, clearPostgres } = require("../test_helper");
const { LunchCycle } = require("@domain");
const {
  PostgresLuncherAvailabilityGateway,
  PostgresLunchCycleGateway,
  PostgresSlackUserResponseGateway
} = require("@gateways");
const config = require("@app/config");
const { RestaurantFactory } = require("../factories");

describe("LuncherAvailabilityGateway", function() {
  const restaurant1 = RestaurantFactory.getRestaurant({
    name: "Restaurant-foo"
  });
  const restaurant2 = RestaurantFactory.getRestaurant({
    name: "Restaurant-bar"
  });
  const restaurant_array = [restaurant1, restaurant2];

  beforeEach(async function() {
    await clearPostgres();
  });

  it("can add user availability", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();

    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: true
    });

    const availabilities = await luncherAvailabilty.getAvailabilities({
      lunch_cycle_id: lunchCycle.id
    });
    expect(availabilities[0].slack_user_id).to.eql("DJWDYWUD124");
    expect(availabilities[0].available).to.eql(true);
  });

  it('can get a list of lunchers', async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();

    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: true
    });

    const availabilities = await luncherAvailabilty.getAvailableUsers({
      lunch_cycle_id: lunchCycle.id
    });
    expect(availabilities[0].slackUserId).to.eql("DJWDYWUD124");
    expect(availabilities[0].available).to.eql(true);
  });
  
    it('can get a users availabilitys by lunch cycle', async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();

    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: true
    });
    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "ZSHDWHWDHWDD",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: true
    });

    const availabilities = await luncherAvailabilty.getUserAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124"
    });
    
    expect(availabilities.length).to.eq(1);
    expect(availabilities[0].restaurantName).to.eql('Restaurant-foo');
    expect(availabilities[0].slackUserId).to.eql("DJWDYWUD124");
    expect(availabilities[0].available).to.eql(true);
  });
    

  it("can add many users availabilities", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();
    const userid = "DJWDYWUD124";
    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: userid,
      restaurant_name: restaurant1.name,
      available: true
    });
    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: userid,
      restaurant_name: restaurant2.name,
      available: true
    });
    const availabilities = await luncherAvailabilty.getAvailabilities({
      lunch_cycle_id: lunchCycle.id
    }); // Is returning what is expected
    expect(availabilities.length).to.eql(2);
  });

  it("adding same user availability twice does not create a duplicate", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);
    const lunchCycle = await setupLunchCycle();

    args = {
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: true
    };
    await luncherAvailabilty.addAvailability(args);
    await luncherAvailabilty.addAvailability(args);

    const availabilities = await luncherAvailabilty.getAvailabilities({
      lunch_cycle_id: lunchCycle.id
    });
    expect(availabilities.length).to.eql(1);
  });

  it("can get user availability with user_id, lunch cycle id & restaurant name", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();

    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: true
    });

    const availableUsers = await luncherAvailabilty.getAvailableUsers({
      lunch_cycle_id: lunchCycle.id
    }); // Returning slack id,real name,lunch cycle ID and restaurant name.
    expect(availableUsers[0].slackUserId).to.eql("DJWDYWUD124");
    expect(availableUsers[0].lunchCycleId).to.eql(lunchCycle.id);
    expect(availableUsers[0].restaurantName).to.eql(restaurant1.name);
    expect(availableUsers[0].email).to.eql("bob@madetech.com");
    expect(availableUsers[0].realName).to.eql("bob");
    expect(availableUsers[0].available).to.eql(true);
  });

  it("get id of users that do not have availability", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();

    const usersWithoutResponce = await luncherAvailabilty.getUsersWithoutResponse({
      lunch_cycle_id: lunchCycle.id
    });

    expect(usersWithoutResponce.length).to.eql(1);
    expect(usersWithoutResponce).to.eql(["DJWDYWUD124"]);
  });

  async function setupLunchCycle() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const newlunchCycle = new LunchCycle({
      restaurants: restaurant_array
    });
    const createdLunchCycle = await postgresLunchCycleGateway.create(newlunchCycle);

    const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();
    await postgresSlackUserResponseGateway.create({
      slackUser: {
        id: "DJWDYWUD124",
        profile: {
          email: "bob@madetech.com",
          real_name: "bob"
        }
      },
      slackMessageResponse: {},
      lunchCycle: createdLunchCycle
    });

    return createdLunchCycle;
  }

  it("can remove user availability", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();

    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: false
    });

    const availabilities = await luncherAvailabilty.getAvailabilities({
      lunch_cycle_id: lunchCycle.id
    });

    expect(availabilities[0].available).to.eql(false);
  });

  it("can change a user availability", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db);

    const lunchCycle = await setupLunchCycle();

    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: true
    });

    let availabilities = await luncherAvailabilty.getAvailabilities({
      lunch_cycle_id: lunchCycle.id
    });
    expect(availabilities[0].available).to.eql(true);

    await luncherAvailabilty.addAvailability({
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: "DJWDYWUD124",
      restaurant_name: lunchCycle.restaurants[0].name,
      available: false
    });
    availabilities = await luncherAvailabilty.getAvailabilities({
      lunch_cycle_id: lunchCycle.id
    });
    expect(availabilities[0].available).to.eql(false);
  });
});
