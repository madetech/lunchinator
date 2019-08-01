const { expect, sinon, config } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { FetchRestaurantsFromGoogleSheet } = require("@use_cases");
const { Dietary, DietaryLevel } = require("@domain");

describe("FetchRestaurantsFromGoogleSheet", function() {
  it("can fetch rows from google sheet", async function() {
    const fakeSheetGateway = {
      fetchRows: () => [
        {
          _links: [],
          _xml: "",
          del: () => {},
          emoji: ":blush:",
          halal: "?",
          id: "sheet_url",
          meat: "great",
          notes: "",
          restaurant: "Nandos",
          save: () => {},
          vegan: "some",
          vegetarian: "some",
          direction: "googlemaps"
        }
      ]
    };

    const expectedRestaurants = [
      RestaurantFactory.getRestaurant({
        name: "Nandos",
        dietaries: new Dietary({
          vegan: DietaryLevel.Some,
          meat: DietaryLevel.Great,
          vegetarian: DietaryLevel.Some,
          halal: DietaryLevel.Unknown
        }),
        notes: "",
        emoji: ":blush:",
        direction: "googlemaps"
      })
    ];

    const sheetGatewaySpy = sinon.spy(fakeSheetGateway, "fetchRows");
    const dummySheetId = "dummy";

    sinon.stub(config, "RESTAURANTS_LIST_SHEET_ID").get(() => dummySheetId);

    const useCase = new FetchRestaurantsFromGoogleSheet({
      googleSheetGateway: fakeSheetGateway
    });
    const response = await useCase.execute();

    expect(response.restaurants).to.eql(expectedRestaurants);
    expect(sheetGatewaySpy).to.have.been.calledOnceWith(dummySheetId);
  });
});
