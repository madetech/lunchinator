const Dietary = require("@domain/dietary");

class GetNewLunchCycleRestaurants {
  execute() {
    return {
      restaurants: [
        { name: "restaurant1", dietaries: [Dietary.Vegan, Dietary.Meat] },
        { name: "restaurant2", dietaries: [Dietary.Meat] }
      ]
    };
  }
}

module.exports = GetNewLunchCycleRestaurants;
