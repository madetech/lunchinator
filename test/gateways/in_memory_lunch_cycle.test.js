const { expect } = require("../test_helper");
const { InMemoryLunchCycleGateway } = require("@gateways");

describe("InMemoryLunchCycleGateway", async function() {
  it("can get previous lunch cycle", async function() {
    const gateway = new InMemoryLunchCycleGateway();
    gateway.lunchCycles = [{ id: 4 }, { id: 5 }];

    expect(await gateway.findPrevious({ id: 7 })).to.eql({ id: 5 });
  });
});
