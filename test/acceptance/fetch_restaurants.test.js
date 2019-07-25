const { expect } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { DietaryLevel } = require("@domain");
const { FetchRestaurantsFromGoogleSheet } = require("@use_cases");

describe("Acceptance Test for Fetching Restaurants", function() {
  it("can fetch the restaurants from the google sheet", function() {
    WhenTheRestaurantsAreFetchedFromTheGoogleSheet();
    ThenTheRestaurantListWillBe([
      RestaurantFactory.getRestaurant({
        dietaries: {
          halal: DietaryLevel.Unknown,
          meat: DietaryLevel.Great,
          vegan: DietaryLevel.Some,
          vegetarian: DietaryLevel.Some
        },
        emoji: ":blush:",
        name: "Nandos",
        notes: ""
      })
    ]);
  });
});

class FakeGoogleSheetGateway {
  fetchRows(sheetId) {
    return [
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
        vegetarian: "some"
      }
    ];
  }
}

let fetchRestaurantsFromGoogleSheetResponse;

function WhenTheRestaurantsAreFetchedFromTheGoogleSheet() {
  const fakeGoogleSheetGateway = new FakeGoogleSheetGateway();
  const useCase = new FetchRestaurantsFromGoogleSheet({
    googleSheetGateway: fakeGoogleSheetGateway
  });
  fetchRestaurantsFromGoogleSheetResponse = useCase.execute();
}

function ThenTheRestaurantListWillBe(expected) {
  expect(fetchRestaurantsFromGoogleSheetResponse.restaurants).to.eql(expected);
}
