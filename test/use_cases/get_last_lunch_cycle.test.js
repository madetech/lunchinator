require("module-alias/register");

const chai = require("chai");
const expect = chai.expect;
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
