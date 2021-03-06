const config = require("@app/config");
const { Restaurant, Dietary, DietaryLevel } = require("@domain");

class FetchRestaurantsFromGoogleSheet {
  constructor(options) {
    this.googleSheetGateway = options.googleSheetGateway;
  }

  async execute() {
    const rows = await this.googleSheetGateway.fetchRows(config.RESTAURANTS_LIST_SHEET_ID);

    return {
      restaurants: rows.map(row => {
        return new Restaurant({
          name: row.restaurant,
          dietaries: this.parseDietaries(row),
          notes: row.notes,
          emoji: row.emoji,
          direction: row.direction
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
