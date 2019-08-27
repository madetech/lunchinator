const { expect, sinon } = require("../test_helper");
const moment = require("moment");
const { GetCurrentLunchCycleWeek } = require("@use_cases");
const config = require("@app/config");

describe("GetCurrentLunchCycleWeek", function() {
  it("can get the lunchCycleWeek for the current week", async function() {
    const friday = moment()
      .day("Friday")
      .format("DD/MM/YYYY");

    const expectedLunchCycleWeek = {
      restaurant: {
        name: "Nandos",
        dietaries: [Object],
        notes: "",
        emoji: ":chicken:",
        direction: "https://goo.gl/maps/dw5ZvPTjWAuPDzSy6",
        date: friday
      },
      lunchers: [],
      allAvailable: []
    };
    const lunchCycleweeks = [
      {
        restaurant: {
          name: "Nandos",
          dietaries: [Object],
          notes: "",
          emoji: ":chicken:",
          direction: "https://goo.gl/maps/dw5ZvPTjWAuPDzSy6",
          date: friday
        },
        lunchers: [],
        allAvailable: []
      },
      {
        restaurant: {
          name: "Velo",
          dietaries: [Object],
          notes: "",
          emoji: ":chopsticks:",
          direction: "https://goo.gl/maps/K1Xdhy3c3UfQrYe49",
          date: "13/09/2019"
        },
        lunchers: [[Object]],
        allAvailable: [[Object]]
      },
      {
        restaurant: {
          name: "The Table",
          dietaries: [Object],
          notes: "",
          emoji: ":fried_egg:",
          direction: "https://g.page/thetablecafe?share",
          date: "20/09/2019"
        },
        lunchers: [],
        allAvailable: []
      },
      {
        restaurant: {
          name: "Tonkotsu",
          dietaries: [Object],
          notes: "",
          emoji: ":bowl_with_spoon:",
          direction: "https://goo.gl/maps/HYPxPyiM1DrK9YVbA",
          date: "27/09/2019"
        },
        lunchers: [],
        allAvailable: []
      },
      {
        restaurant: {
          name: "Union Viet",
          dietaries: [Object],
          notes: "",
          emoji: ":ramen:",
          direction: "https://g.page/unionviet?share",
          date: "04/10/2019"
        },
        lunchers: [],
        allAvailable: []
      }
    ];

    const lunchCycleGatewayStub = { getCurrent: sinon.fake.returns(lunchCycleweeks) };

    const getCurrentLunchCycleWeek = new GetCurrentLunchCycleWeek({
      lunchCycleDrawGateway: lunchCycleGatewayStub
    });
    const response = await getCurrentLunchCycleWeek.execute();

    expect(response.lunchCycleWeek).to.eql(expectedLunchCycleWeek);
  });
});
