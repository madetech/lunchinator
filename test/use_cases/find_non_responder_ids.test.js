const { sinon, expect } = require("../test_helper");
const { FindNonResponderIds } = require("@use_cases");

let luncherAvailabilityGateway;
let lunchCycleGateway;
let usecase;
describe("FindNonResponderIds", function() {
           
  it("can find non responders when no one has responded", async function() {
    const expectedUserIds = ["user1", "user2"];

    const luncherAvailabilityGateway = { getUsersWithoutResponse: sinon.fake.returns(expectedUserIds) }
    const lunchCycleGateway =  { getCurrent: sinon.stub().returns({ id: "1" }) }

    const useCase = new FindNonResponderIds({
      luncherAvailabilityGateway: luncherAvailabilityGateway,
      lunchCycleGateway: lunchCycleGateway
    });

    const response = await useCase.execute();
    expect(luncherAvailabilityGateway.getUsersWithoutResponse.calledWith({lunch_cycle_id: 1}));

    expect(response.nonResponderIds).to.eql(expectedUserIds);
  });

  it("can't find non responders when everyone has responded", async function() {
    const expectedUserIds = [];

    const luncherAvailabilityGateway = { getUsersWithoutResponse: sinon.fake.returns(expectedUserIds) }
    const lunchCycleGateway =  { getCurrent: sinon.stub().returns({ id: "1" }) }

    const useCase = new FindNonResponderIds({
      luncherAvailabilityGateway: luncherAvailabilityGateway,
      lunchCycleGateway: lunchCycleGateway
    });

    const response = await useCase.execute();
    expect(luncherAvailabilityGateway.getUsersWithoutResponse.calledWith({lunch_cycle_id: 1}));

    expect(response.nonResponderIds).to.eql([]);
  });
});
