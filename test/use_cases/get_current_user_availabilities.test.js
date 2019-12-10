const { expect, sinon } = require("../test_helper");
const { GetCurrentUserAvailabilities } = require("@use_cases");

describe("GetCurrentUserAvailabilities", function() {
  const lunchCycleId = 12121;
  const lunchCycleObject = {
    id: lunchCycleId
  };

  it("can get the current lunchCycle", async function() {
    const luncherAvailabilityGateway = {
      getAvailableUsers: sinon.fake.resolves({})
    };
    const lunchCycleGateway = {
      getCurrent: sinon.fake.resolves(lunchCycleObject)
    };

    const useCase = new GetCurrentUserAvailabilities({
      lunchCycleGateway: lunchCycleGateway,
      luncherAvailabilityGateway: luncherAvailabilityGateway
    });

    const response = await useCase.execute();
    expect(lunchCycleGateway.getCurrent).to.have.been.called;
    expect(luncherAvailabilityGateway.getAvailableUsers).to.have.been.calledWith({ lunch_cycle_id: lunchCycleId });

    expect(response.lunchCycle).to.be.eql(lunchCycleObject);
  });

  it("can get the current availableUsers", async function() {
    const availableUsers = [
      {
        slackUserId: "bb01",
        lunchCycleId: 1,
        firstName: "bugsbunny",
        restaurantName: "restaurant1",
        email: 'bugs@madetech.com'
      },
      {
        slackUserId: "bb02",
        lunchCycleId: 1,
        firstName: "baebunny",
        restaurantName: "restaurant2",
        email: "bae@madetech.com"
      }
    ];
    const luncherAvailabilityGateway = {
      getAvailableUsers: sinon.fake.resolves(availableUsers)
    };

    const lunchCycleGateway = {
      getCurrent: sinon.fake.resolves(lunchCycleObject)
    };

    const useCase = new GetCurrentUserAvailabilities({
      lunchCycleGateway: lunchCycleGateway,
      luncherAvailabilityGateway: luncherAvailabilityGateway
    });

    const response = await useCase.execute();
    expect(lunchCycleGateway.getCurrent).to.have.been.called;
    expect(luncherAvailabilityGateway.getAvailableUsers).to.have.been.calledWith({ lunch_cycle_id: lunchCycleId });

    expect(response.availableUsers).to.be.eql(availableUsers);
  })
});
