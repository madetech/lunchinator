const moment = require("moment");
const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const config = require("@app/config");
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
      userId: "validUserId",
      restaurants: [RestaurantFactory.getRestaurant()],
      startsAt: "2020-01-01T00:00:00+01:00"
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
    const weeksAhead = 1;

    // get the friday in weeksAhead weeks time
    const expected = moment
      .utc()
      .startOf("isoWeek")
      .add(4, "days")
      .add(weeksAhead, "week")
      .format();

    sinon.stub(config, "WEEKS_BEFORE_CYCLE_STARTS").get(() => weeksAhead);

    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: {
        create: sinon.fake.returns(new LunchCycle({ starts_at: expected }))
      }
    });

    const response = await useCase.execute({
      restaurants: [RestaurantFactory.getRestaurant()]
    });

    expect(response.lunchCycle.starts_at).to.be.eql(expected);
  });
});
