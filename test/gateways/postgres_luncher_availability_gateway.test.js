const { expect, clearPostgres } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { PostgresLuncherAvailabilityGateway, PostgresLunchCycleGateway } = require("@gateways");
const config = require("@app/config");
const { RestaurantFactory } = require("../factories");

describe("LuncherAvailabilityGateway", function() {
  beforeEach(async function() {
    await clearPostgres();
  });
  
  it("can add user availability", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway({dbconfig: config.db})

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
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway({dbconfig: config.db})

    const lunchCycle = await setupLunchCycle()

    await luncherAvailabilty.addAvailability({
      slack_user_id: 'DJWDYWUD124', 
      lunch_cycle_id: lunchCycle.id,
      restaurant_name: lunchCycle.restaurants[0].name
   })
    
   await luncherAvailabilty.addAvailability({
    slack_user_id: 'FT65739934DGRT', 
    lunch_cycle_id: lunchCycle.id,
    restaurant_name: lunchCycle.restaurants[0].name
 })
   const availabilities = await luncherAvailabilty.getAvailabilities({lunch_cycle_id: lunchCycle.id})
   expect(availabilities.length).to.eql(2);
  })
  
  it("cannot add same user availability twice", async function() {
    let luncherAvailabilty = new PostgresLuncherAvailabilityGateway({dbconfig: config.db})

    const lunchCycle = await setupLunchCycle()

    await luncherAvailabilty.addAvailability({
      slack_user_id: 'DJWDYWUD124', 
      lunch_cycle_id: lunchCycle.id,
      restaurant_name: lunchCycle.restaurants[0].name
   })
    
   return luncherAvailabilty.addAvailability(
  {
    slack_user_id: 'DJWDYWUD124', 
    lunch_cycle_id: lunchCycle.id,
    restaurant_name: lunchCycle.restaurants[0].name
  }).catch(function(e){
    expect(e.message).to.eql('duplicate key value violates unique constraint "availability_lunch_cycle_id_slack_user_id_unique_index"')
  })

  })
  
  async function setupLunchCycle() {
    const restaurant = RestaurantFactory.getRestaurant({
      name: "Restaurant-foo",
    });

    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const newlunchCycle = new LunchCycle({
      restaurants: [restaurant]
    });
    const createdLunchCycle = await postgresLunchCycleGateway.create(newlunchCycle);
    return createdLunchCycle
  }
  
})
