const { expect } = require("../test_helper");
const { InMemoryLunchCycleGateway } = require("@gateways");

describe("InMemoryLunchCycleGateway", async function() {
  it("can get the current lunch cycle", async function() {
    const gateway = new InMemoryLunchCycleGateway();
    gateway.lunchCycles = [{ id: 4 }, { id: 5 }];

    const lunchCycle = await gateway.getCurrent();
    expect(lunchCycle).to.eql({ id: 5 });
  });
});
