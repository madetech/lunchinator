const config = require("@app/config");
const Restaurant = require("@domain/restaurant");
const Dietary = require("@domain/dietary");
const DietaryLevel = require("@domain/dietary_level");

class FetchRestaurantsFromGoogleSheet {
  constructor(options) {
    this.googleSheetGateway = options.googleSheetGateway;
  }

  execute() {
    const rows = this.googleSheetGateway.fetchRows(config.RESTAURANTS_LIST_SHEET_ID);

    return {
      restaurants: rows.map(row => {
        return new Restaurant({
          name: row.restaurant,
          dietaries: this.parseDietaries(row),
          notes: row.notes,
          emoji: row.emoji
        });
      })
    };
  }

  parseDietaries(row) {
    return new Dietary({
      vegan: DietaryLevel.getLevel(row.vegan),
      vegetarian: DietaryLevel.getLevel(row.vegetarian),
      meat: DietaryLevel.getLevel(row.meat),
      halal: DietaryLevel.getLevel(row.halal)
    });
  }
}

module.exports = FetchRestaurantsFromGoogleSheet;
