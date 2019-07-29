const { expect } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { RestaurantFactory } = require("../factories");
const { PostgresLunchCycleGateway } = require("@gateways");

describe("PostgresLunchCycleGateway", function() {
  beforeEach(async function() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();

    const client = await postgresLunchCycleGateway._client();
    await client.query("TRUNCATE lunch_cycles RESTART IDENTITY");

    client.end();
  });

  it("create", async function() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const nestedRestaurant1 = RestaurantFactory.getRestaurant();
    const nestedRestaurant2 = RestaurantFactory.getRestaurant({
      name: "Restaurant2",
      emoji: ":tada:"
    });

    expect(await postgresLunchCycleGateway.count()).to.eql(0);
    const lunchCycle = new LunchCycle({
      restaurants: [nestedRestaurant1, nestedRestaurant2]
    });
    expect(lunchCycle.id).to.be.undefined;

    const returnedLunchCycle = await postgresLunchCycleGateway.create(lunchCycle);

    expect(await postgresLunchCycleGateway.count()).to.eql(1);
    expect(returnedLunchCycle).to.not.eql(lunchCycle);
    expect(returnedLunchCycle.id).to.satisfy(Number.isInteger);
    expect(returnedLunchCycle.restaurants).to.eql([nestedRestaurant1, nestedRestaurant2]);
  });

  it("returns all Lunch Cycles", async function() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();

    const restaurants = [
      RestaurantFactory.getRestaurant(),
      RestaurantFactory.getRestaurant({
        name: "Restaurant2",
        emoji: ":tada:"
      }),
      RestaurantFactory.getRestaurant({
        name: "Restaurant3",
        emoji: ":ghost:"
      })
    ];

    const lunchCycle1 = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: [...restaurants]
      })
    );
    const lunchCycle2 = await postgresLunchCycleGateway.create(
      new LunchCycle({
        restaurants: [restaurants[1], restaurants[0]]
      })
    );

    const allLunchCycles = await postgresLunchCycleGateway.all();

    expect(allLunchCycles).to.eql([lunchCycle1, lunchCycle2]);
  });

  it("can count", async function() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    await postgresLunchCycleGateway.create(new LunchCycle());
    await postgresLunchCycleGateway.create(new LunchCycle());
    await postgresLunchCycleGateway.create(new LunchCycle());

    expect(await postgresLunchCycleGateway.count()).to.eql(3);
  });

  it("can get previous lunch cycle", async function() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    // Add some dummy data to ensure we get the order right.
    await postgresLunchCycleGateway.create(new LunchCycle());
    await postgresLunchCycleGateway.create(new LunchCycle());
    const notExpecting3 = await postgresLunchCycleGateway.create(new LunchCycle());
    const expecting = await postgresLunchCycleGateway.create(new LunchCycle());
    const notExpecting4 = await postgresLunchCycleGateway.create(new LunchCycle());

    // Verify we're going to get the correct object.
    expect(expecting.id).to.be.above(notExpecting3.id);
    expect(expecting.id).to.be.below(notExpecting4.id);

    expect(await postgresLunchCycleGateway.findPrevious(notExpecting4)).to.eql(expecting);
  });
});
