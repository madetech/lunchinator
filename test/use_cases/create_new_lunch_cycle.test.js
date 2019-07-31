const { expect, sinon } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { CreateNewLunchCycle } = require("@use_cases");

describe("CreateNewLunchCycle", async function() {
  it("creates a new lunch cycle", async function() {
    const lunchCycleDummy = {};
    const gatewaySpy = { create: sinon.fake.returns(lunchCycleDummy) };
    const fakeIsValidLunchinatorUser = { execute: sinon.fake.returns({ isValid: true }) };
    const useCase = new CreateNewLunchCycle({
      lunchCycleGateway: gatewaySpy,
      isValidLunchinatorUser: fakeIsValidLunchinatorUser
    });

    const response = await useCase.execute({ userId: "validUserId", restaurants: [] });

    expect(gatewaySpy.create).to.have.been.calledWith(sinon.match.instanceOf(LunchCycle));
    expect(response.lunchCycle).to.equal(lunchCycleDummy);
  });

  it("does not create a lunch cycle for invalid user", async function() {
    const invalidUserIdDummy = "invalid";
    const gatewayDummy = {};
    const isValidLunchinatorUserFake = { execute: () => false };
    const isValidLunchinatorUserSpy = sinon.spy(isValidLunchinatorUserFake, "execute");
    const useCase = new CreateNewLunchCycle({
      gateway: gatewayDummy,
      isValidLunchinatorUser: isValidLunchinatorUserFake
    });

    const response = await useCase.execute({ userId: invalidUserIdDummy });

    expect(response.lunchCycle).to.be.null;
    expect(isValidLunchinatorUserSpy).to.have.been.calledWith({ userId: invalidUserIdDummy });
  });
});
