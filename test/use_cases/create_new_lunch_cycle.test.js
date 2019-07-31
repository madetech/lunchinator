const { expect, sinon } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");
const { CreateNewLunchCycle } = require("@use_cases");

describe("CreateNewLunchCycle", async function() {
  it("creates a new lunch cycle", async function() {
    const lunchCycleDummy = {};
    const gatewaySpy = { create: sinon.fake.returns(lunchCycleDummy) };

    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: gatewaySpy,
      isValidLunchinatorUser: { execute: sinon.fake.returns({ isValid: true }) }
    });

    const response = await useCase.execute({
      userId: "validUserId",
      restaurants: [RestaurantFactory.getRestaurant()],
      startsAt: "01-01-2020"
    });

    expect(gatewaySpy.create).to.have.been.calledWith(sinon.match.instanceOf(LunchCycle));
    expect(response.lunchCycle).to.equal(lunchCycleDummy);
  });

  it("does not create a lunch cycle for invalid user", async function() {
    const invalidUserIdDummy = "invalid";
    const isValidLunchinatorUserSpy = { execute: sinon.fake.returns({ isValid: false }) };

    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: {},
      isValidLunchinatorUser: isValidLunchinatorUserSpy
    });

    const response = await useCase.execute({
      userId: invalidUserIdDummy
    });

    expect(isValidLunchinatorUserSpy.execute).to.have.been.calledWith({
      userId: invalidUserIdDummy
    });
    expect(response.lunchCycle).to.be.undefined;
    expect(response.error).to.be.eql("unauthorised slack user.");
  });

  it("does not create a lunch cycle when no restaurants provided", async function() {
    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: {},
      isValidLunchinatorUser: { execute: sinon.fake.returns({ isValid: true }) }
    });

    const response = await useCase.execute({ restaurants: [] });

    expect(response.lunchCycle).to.be.undefined;
    expect(response.error).to.be.eql("invalid list of restaurants.");
  });

  it("does not create a lunch cycle when an invalid start date is provided", async function() {
    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: {},
      isValidLunchinatorUser: { execute: sinon.fake.returns({ isValid: true }) }
    });

    const response = await useCase.execute({
      restaurants: [RestaurantFactory.getRestaurant()],
      startsAt: "xxx"
    });

    expect(response.lunchCycle).to.be.undefined;
    expect(response.error).to.be.eql("invalid start date.");
  });

  it("creates a lunch cycle with the correct date when a date is provided", async function() {
    const expected = "2020-01-25T00:00:00.000Z";

    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: {
        create: sinon.fake.returns(new LunchCycle({ starts_at: expected }))
      },
      isValidLunchinatorUser: { execute: sinon.fake.returns({ isValid: true }) }
    });

    const response = await useCase.execute({
      restaurants: [RestaurantFactory.getRestaurant()],
      startsAt: "25-01-2020"
    });

    expect(response.lunchCycle.starts_at).to.be.eql(expected);
  });
});
