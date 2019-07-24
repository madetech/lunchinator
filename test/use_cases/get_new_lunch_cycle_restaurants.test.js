const { expect, sinon } = require("../test_helper");
const GetNewLunchCycleRestaurants = require("@use_cases/get_new_lunch_cycle_restaurants");
const Dietary = require("@domain/dietary");

describe("GetNewLunchCycleRestaurants", function() {
  it("uses the previous lunch cycle's restaurants", function() {
    const restaurants = [
      { name: "restaurant1", dietaries: [Dietary.Meat] },
      { name: "restaurant2", dietaries: [Dietary.Vegan] },
      { name: "restaurant3", dietaries: [Dietary.Vegan] },
      { name: "restaurant4", dietaries: [Dietary.Vegan] },
      { name: "restaurant5", dietaries: [Dietary.Vegan] },
      { name: "restaurant6", dietaries: [Dietary.Vegan] },
      { name: "restaurant7", dietaries: [Dietary.Vegan] },
      { name: "restaurant8", dietaries: [Dietary.Vegan] }
    ];
    const restaurantsGateway = {
      all: sinon.fake.returns(restaurants)
    };
    const getPreviousLunchFake = {
      execute: sinon.fake.returns({
        previousLunchCycle: {
          restaurants: restaurants.slice(0, 6)
        }
      })
    };

    const response = new GetNewLunchCycleRestaurants({
      restaurantsGateway: restaurantsGateway,
      getPreviousLunchCycle: getPreviousLunchFake
    }).execute();

    expect(response.restaurants).to.eql([
      { name: "restaurant7", dietaries: [Dietary.Vegan] },
      { name: "restaurant8", dietaries: [Dietary.Vegan] },
      { name: "restaurant1", dietaries: [Dietary.Meat] },
      { name: "restaurant2", dietaries: [Dietary.Vegan] },
      { name: "restaurant3", dietaries: [Dietary.Vegan] },
      { name: "restaurant4", dietaries: [Dietary.Vegan] }
    ]);
  });

  it("can handle no previous lunch cycle", function() {
    const restaurants = [
      { name: "restaurant1", dietaries: [Dietary.Meat] },
      { name: "restaurant2", dietaries: [Dietary.Vegan] },
      { name: "restaurant3", dietaries: [Dietary.Vegan] },
      { name: "restaurant4", dietaries: [Dietary.Vegan] },
      { name: "restaurant5", dietaries: [Dietary.Vegan] },
      { name: "restaurant6", dietaries: [Dietary.Vegan] },
      { name: "restaurant7", dietaries: [Dietary.Vegan] },
      { name: "restaurant8", dietaries: [Dietary.Vegan] }
    ];
    const restaurantsGateway = {
      all: sinon.fake.returns(restaurants)
    };
    const getPreviousLunchFake = {
      execute: sinon.fake.returns({ previousLunchCycle: null })
    };

    const response = new GetNewLunchCycleRestaurants({
      restaurantsGateway: restaurantsGateway,
      getPreviousLunchCycle: getPreviousLunchFake
    }).execute();

    expect(response.restaurants).to.eql([
      { name: "restaurant1", dietaries: [Dietary.Meat] },
      { name: "restaurant2", dietaries: [Dietary.Vegan] },
      { name: "restaurant3", dietaries: [Dietary.Vegan] },
      { name: "restaurant4", dietaries: [Dietary.Vegan] },
      { name: "restaurant5", dietaries: [Dietary.Vegan] },
      { name: "restaurant6", dietaries: [Dietary.Vegan] }
    ]);
  });
});
