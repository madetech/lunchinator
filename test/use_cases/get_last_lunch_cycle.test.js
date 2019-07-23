const { expect } = require("../test_helper");
const GetLastLunchCycle = require("@use_cases/get_last_lunch_cycle");

describe("GetLastLunchCycle", function() {
  it("get the last lunch cycle", function() {
    const dummyDunchCycle = {};
    const fakeGateway = { last: () => dummyDunchCycle };
    const useCase = new GetLastLunchCycle({ gateway: fakeGateway });

    const lunchCycle = useCase.execute();

    expect(lunchCycle).to.equal(dummyDunchCycle);
  });
});
