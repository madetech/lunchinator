const { expect } = require("../test_helper");
const InMemoryLunchCycleGateway = require("@gateways/in_memory_lunch_cycle_gateway");

describe("InMemoryLunchCycleGateway", function() {
  it("can get previous lunch cycle", function() {
    const gateway = new InMemoryLunchCycleGateway();
    gateway.lunchCycles = [{ id: 4 }, { id: 5 }];

    expect(gateway.findPrevious({ id: 7 })).to.eql({ id: 5 });
  });
});