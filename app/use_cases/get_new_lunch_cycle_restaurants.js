const config = require("@app/config");

class GetNewLunchCycleRestaurants {
  constructor(options) {
    this.fetchRestaurantsFromGoogleSheet = options.fetchRestaurantsFromGoogleSheet;
    this.getPreviousLunchCycle = options.getPreviousLunchCycle;
  }

  async execute() {
    const prevResponse = await this.getPreviousLunchCycle.execute();
    const fetchResponse = await this.fetchRestaurantsFromGoogleSheet.execute();

    const restaurants = this.findNextRestaurants(
      fetchResponse.restaurants,
      prevResponse.previousLunchCycle
    );

    return { restaurants: restaurants };
  }

  findNextRestaurants(allRestaurants, previousLunchCycle) {
    if (previousLunchCycle === null || !previousLunchCycle || !previousLunchCycle.restaurants) {
      return allRestaurants.slice(0, config.CYCLE_LENGTH);
    }

    const indexOfLastRestaurant = this.getIndexOfLastRestaurant(allRestaurants, previousLunchCycle);

    const nextRestaurants = allRestaurants.slice(indexOfLastRestaurant + 1);
    if (nextRestaurants.length < config.CYCLE_LENGTH) {
      // if at the end of list wrap around to the top again
      return nextRestaurants.concat(
        allRestaurants.slice(0, config.CYCLE_LENGTH - nextRestaurants.length)
      );
    }

    return nextRestaurants;
  }

  getIndexOfLastRestaurant(allRestaurants, previousLunchCycle) {
    const [lastRestaurant] = previousLunchCycle.restaurants.slice(-1);

    if (lastRestaurant) {
      return allRestaurants.findIndex(res => res.name === lastRestaurant.name);
    }

    return 0;
  }
}

module.exports = GetNewLunchCycleRestaurants;
