const { expect, clearPostgres } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { PostgresLuncherAvailabilityGateway, PostgresLunchCycleGateway } = require("@gateways");
const config = require("@app/config");
const { RestaurantFactory } = require("../factories");

describe("LuncherAvailabilityGateway", function() {
           
  const restaurant1 = RestaurantFactory.getRestaurant({
    name: "Restaurant-foo",
  });
  const restaurant2 = RestaurantFactory.getRestaurant({
    name: "Restaurant-bar",
  });
  const restaurant_array = [restaurant1, restaurant2]

  beforeEach(async function() {
    await clearPostgres();
  });
  
  it("can add user availability", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db)

    const lunchCycle = await setupLunchCycle()

    await luncherAvailabilty.addAvailability({
      slack_user_id: 'DJWDYWUD124', 
      lunch_cycle_id: lunchCycle.id,
      restaurant_name: lunchCycle.restaurants[0].name
   })
   
   const availabilities = await luncherAvailabilty.getAvailabilities({lunch_cycle_id: lunchCycle.id})
   expect(availabilities[0].slack_user_id).to.eql('DJWDYWUD124');
  })
  
  it("can add many users availabilities", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db)

    const lunchCycle = await setupLunchCycle()
    const userid = 'DJWDYWUD124'
    await luncherAvailabilty.addAvailability({
      slack_user_id: userid, 
      lunch_cycle_id: lunchCycle.id,
      restaurant_name: restaurant1.name
   })
   await luncherAvailabilty.addAvailability({
    slack_user_id: userid, 
    lunch_cycle_id: lunchCycle.id,
    restaurant_name: restaurant2.name
  })
   const availabilities = await luncherAvailabilty.getAvailabilities({lunch_cycle_id: lunchCycle.id})
   expect(availabilities.length).to.eql(2);
  })
  
  it("adding same user availability twice does not create a duplicate", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db)
    const lunchCycle = await setupLunchCycle()

    args = {
      slack_user_id: 'DJWDYWUD124', 
      lunch_cycle_id: lunchCycle.id,
      restaurant_name: lunchCycle.restaurants[0].name
    }
    await luncherAvailabilty.addAvailability(args)
    await luncherAvailabilty.addAvailability(args)
    
    const availabilities = await luncherAvailabilty.getAvailabilities({lunch_cycle_id: lunchCycle.id})
    expect(availabilities.length).to.eql(1);
  })
  
  async function setupLunchCycle() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const newlunchCycle = new LunchCycle({
      restaurants: restaurant_array
    });
    const createdLunchCycle = await postgresLunchCycleGateway.create(newlunchCycle);
    return createdLunchCycle
  }
  
})
