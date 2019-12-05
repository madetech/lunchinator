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
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: 'DJWDYWUD124', 
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
      lunch_cycle_id: lunchCycle.id,
    slack_user_id: userid, 
    restaurant_name: restaurant1.name
   })
   await luncherAvailabilty.addAvailability({
    lunch_cycle_id: lunchCycle.id,
    slack_user_id: userid, 
    restaurant_name: restaurant2.name
  })
   const availabilities = await luncherAvailabilty.getAvailabilities({lunch_cycle_id: lunchCycle.id}) // Is returning what is expected
   expect(availabilities.length).to.eql(2);
  })
  
  it("adding same user availability twice does not create a duplicate", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db)
    const lunchCycle = await setupLunchCycle()

    args = {
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: 'DJWDYWUD124',
      restaurant_name: lunchCycle.restaurants[0].name
    }
    await luncherAvailabilty.addAvailability(args)
    await luncherAvailabilty.addAvailability(args)
    
    const availabilities = await luncherAvailabilty.getAvailabilities({lunch_cycle_id: lunchCycle.id})
    expect(availabilities.length).to.eql(1);
  })
  
  it("can get user availability with name", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway(config.db)

    const lunchCycle = await setupLunchCycle()

    await luncherAvailabilty.addAvailability({ 
      lunch_cycle_id: lunchCycle.id,
      slack_user_id: 'DJWDYWUD124',
      restaurant_name: lunchCycle.restaurants[0].name
   })
   await luncherAvailabilty.addAvailability({ 
    lunch_cycle_id: lunchCycle.id,
    slack_user_id: 'DJWDYWUD124',
    restaurant_name: lunchCycle.restaurants[1].name
 })
   const availabilities = await luncherAvailabilty.getAvailabilities({lunch_cycle_id: lunchCycle.id}) // This returns what is expected!
   const availableUsers = await luncherAvailabilty.getAvailableUsers({lunch_cycle_id: lunchCycle.id}) // Returning slack id and first name amnd lunch cycle ID
   expect(availableUsers[0].slack_user_id).to.eql('DJWDYWUD124');
   expect(availableUsers[0].lunch_cycle_id).to.eql(lunchCycle.id);
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
