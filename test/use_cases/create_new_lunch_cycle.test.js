const moment = require("moment");
const { expect, sinon, config } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");
const { CreateNewLunchCycle } = require("@use_cases");

describe("CreateNewLunchCycle", function() {
  it("creates a new lunch cycle", async function() {
    const lunchCycleDummy = {};
    const gatewaySpy = { create: sinon.fake.returns(lunchCycleDummy) };

    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: gatewaySpy
    });

    const response = await useCase.execute({
      restaurants: [RestaurantFactory.getRestaurant()]
    });

    expect(gatewaySpy.create).to.have.been.calledWith(sinon.match.instanceOf(LunchCycle));
    expect(response.lunchCycle).to.equal(lunchCycleDummy);
  });

  it("does not create a lunch cycle when no restaurants provided", async function() {
    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: {}
    });

    const response = await useCase.execute({ restaurants: [] });

    expect(response.lunchCycle).to.be.undefined;
    expect(response.error).to.be.eql("invalid list of restaurants.");
  });

  it("can calculate the correct start date", async function() {
    sinon.stub(config, "WEEKS_BEFORE_CYCLE_STARTS").get(() => 1);

    const expectedDate = moment
      .utc()
      .startOf("isoWeek")
      .add(4, "days")
      .add(config.WEEKS_BEFORE_CYCLE_STARTS, "week");

    const expectedRestaurants = [
      RestaurantFactory.getRestaurant({
        date: expectedDate.format("DD/MM/YYYY")
      })
    ];

    const lunchCycleGatewaySpy = { create: sinon.fake.resolves({}) };
    const useCase = new CreateNewLunchCycle({ lunchCycleGateway: lunchCycleGatewaySpy });

    await useCase.execute({ restaurants: [RestaurantFactory.getRestaurant()] });

    expect(lunchCycleGatewaySpy.create).to.have.been.calledWith(
      new LunchCycle({
        restaurants: expectedRestaurants,
        starts_at: expectedDate.format()
      })
    );
  });
});
