const { expect, sinon } = require("../test_helper");
const LunchCycle = require("@domain/lunch_cycle");
const CreateNewLunchCycle = require("@use_cases/create_new_lunch_cycle");

describe("CreateNewLunchCycle", function() {
  it("creates a new lunch cycle", function() {
    const lunchCycleDummy = {};
    const gatewaySpy = { create: sinon.fake.returns(lunchCycleDummy) };
    const fakeIsValidLunchinatorUser = { execute: sinon.fake.returns({ isValid: true }) };
    const useCase = new CreateNewLunchCycle({
      gateway: gatewaySpy,
      isValidLunchinatorUser: fakeIsValidLunchinatorUser
    });

    const response = useCase.execute({ userId: "validUserId" });

    expect(gatewaySpy.create).to.have.been.calledWith(sinon.match.instanceOf(LunchCycle));
    expect(response.lunchCycle).to.equal(lunchCycleDummy);
  });

  it("does not create a lunch cycle for invalid user", function() {
    const invalidUserIdDummy = "invalid";
    const gatewayDummy = {};
    const isValidLunchinatorUserFake = { execute: () => false };
    const isValidLunchinatorUserSpy = sinon.spy(isValidLunchinatorUserFake, "execute");
    const useCase = new CreateNewLunchCycle({
      gateway: gatewayDummy,
      isValidLunchinatorUser: isValidLunchinatorUserFake
    });

    const response = useCase.execute({ userId: invalidUserIdDummy });

    expect(response.lunchCycle).to.be.null;
    expect(isValidLunchinatorUserSpy).to.have.been.calledWith({ userId: invalidUserIdDummy });
  });
});
