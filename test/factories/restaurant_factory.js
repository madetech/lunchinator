require("module-alias/register");
const { Dietary, DietaryLevel, Restaurant } = require("@domain");

class RestaurantFactory {
  static getRestaurant(overrides = {}) {
    const base = {
      name: "restaurant1",
      dietaries: new Dietary({
        vegan: DietaryLevel.Great,
        vegetarian: DietaryLevel.Some,
        halal: DietaryLevel.Unknown,
        meat: DietaryLevel.Great
      }),
      notes: "",
      emoji: ":bowtie:", //restaurant identifier for google sheet
      direction: "googlemaps"
    };

    return new Restaurant({ ...base, ...overrides });
  }
}

module.exports = RestaurantFactory;
