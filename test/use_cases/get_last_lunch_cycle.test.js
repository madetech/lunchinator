const { expect } = require("../test_helper");
const GetLastLunchCycle = require("@use_cases/get_last_lunch_cycle");

describe("GetLastLunchCycle", function() {
  it("get the last lunch cycle", function() {
    const dummyLunchCycle = {};
    const fakeGateway = { last: () => dummyLunchCycle };
    const useCase = new GetLastLunchCycle({ gateway: fakeGateway });

    const response = useCase.execute();

    expect(response.lastLunchCycle).to.equal(dummyLunchCycle);
  });
});
