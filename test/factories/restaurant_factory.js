require("module-alias/register");
const Dietary = require("@domain/dietary");
const DietaryLevel = require("@domain/dietary_level");
const Restaurant = require("@domain/restaurant.js");

class RestaurantFactory {
  static getRestaurant(overrides = {}) {
    const base = {
      name: "restaurant1",
      dietaries: new Dietary({ vegan: DietaryLevel.Great }),
      notes: "notes",
      emoji: ":bowtie:"
    };

    return new Restaurant({ ...base, ...overrides });
  }
}

module.exports = RestaurantFactory;
