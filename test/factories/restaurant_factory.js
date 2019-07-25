require("module-alias/register");
const { Dietary, DietaryLevel, Restaurant } = require("@domain");

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
