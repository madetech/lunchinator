const { expect } = require("../test_helper");
const { LunchCycle, Restaurant } = require("@domain");
const { RestaurantFactory } = require("../factories");
const { PostgresLunchCycleGateway } = require("@gateways");

describe("PostgresLunchCycleGateway", function() {
  beforeEach(async function() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();

    const client = await postgresLunchCycleGateway._client();
    await client.query("TRUNCATE lunch_cycles RESTART IDENTITY");
  });

  it("create", async function() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const nestedRestaurant = RestaurantFactory.getRestaurant();

    expect(await postgresLunchCycleGateway.count()).to.eql(0);
    const lunchCycle = new LunchCycle({
      restaurants: [nestedRestaurant]
    });
    expect(lunchCycle.id).to.be.undefined;

    const returnedLunchCycle = await postgresLunchCycleGateway.create(lunchCycle);

    expect(await postgresLunchCycleGateway.count()).to.eql(1);
    expect(returnedLunchCycle).to.not.eql(lunchCycle);
    expect(returnedLunchCycle.id).to.satisfy(Number.isInteger);
    expect(returnedLunchCycle.restaurants).to.eql([nestedRestaurant]);
  });

});
