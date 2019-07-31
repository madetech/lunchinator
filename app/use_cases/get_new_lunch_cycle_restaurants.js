const config = require("@app/config");

class GetNewLunchCycleRestaurants {
  constructor(options) {
    this.fetchRestaurantsFromGoogleSheet = options.fetchRestaurantsFromGoogleSheet;
    this.getPreviousLunchCycle = options.getPreviousLunchCycle;
  }

  async execute() {
    const prevResponse = await this.getPreviousLunchCycle.execute();
    const fetchResponse = await this.fetchRestaurantsFromGoogleSheet.execute();
    const allRestaurants = fetchResponse.restaurants;

    let newRestaurants;

    if (prevResponse.previousLunchCycle != null && prevResponse.previousLunchCycle.restaurants) {
      newRestaurants = this.findNextRestaurants(allRestaurants, prevResponse.previousLunchCycle);
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
