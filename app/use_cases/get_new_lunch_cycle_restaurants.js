const config = require("@app/config");

class GetNewLunchCycleRestaurants {
  constructor(options) {
    this.fetchRestaurantsFromGoogleSheet = options.fetchRestaurantsFromGoogleSheet;
    this.getPreviousLunchCycle = options.getPreviousLunchCycle;
  }

  execute(lunchCycle) {
    const previousLunchCycle = this.getPreviousLunchCycle.execute(lunchCycle).previousLunchCycle;
    const allRestaurants = this.fetchRestaurantsFromGoogleSheet.execute().restaurants;

    let newRestaurants;

    if (previousLunchCycle && previousLunchCycle.restaurants) {
      newRestaurants = this.findNextRestaurants(allRestaurants, previousLunchCycle);
    } else {
      newRestaurants = allRestaurants.slice(0, config.CYCLE_LENGTH);
    }

    return {
      restaurants: newRestaurants
    };
  }

  findNextRestaurants(allRestaurants, previousLunchCycle) {
    const [lastRestaurant] = previousLunchCycle.restaurants.slice(-1);

    const indexOfLastRestaurant = allRestaurants.findIndex(res => res.name === lastRestaurant.name);

    let nextRestaurants = allRestaurants.slice(indexOfLastRestaurant + 1);
    if (nextRestaurants.length < config.CYCLE_LENGTH) {
      nextRestaurants = nextRestaurants.concat(
        allRestaurants.slice(0, config.CYCLE_LENGTH - nextRestaurants.length)
      );
    }

    return nextRestaurants;
  }
}

module.exports = GetNewLunchCycleRestaurants;
