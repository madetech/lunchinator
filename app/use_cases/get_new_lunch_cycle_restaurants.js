const config = require("@app/config");

class GetNewLunchCycleRestaurants {
  constructor(options) {
    this.restaurantsGateway = options.restaurantsGateway;
    this.getPreviousLunchCycle = options.getPreviousLunchCycle;
  }

  execute(lunchCycle) {
    const previousLunchCycle = this.getPreviousLunchCycle.execute(lunchCycle).previousLunchCycle;
    let newRestaurants;

    if (previousLunchCycle && previousLunchCycle.restaurants) {
      newRestaurants = this.findNextRestaurants(previousLunchCycle);
    } else {
      newRestaurants = this.restaurantsGateway.all().slice(0, config.CYCLE_LENGTH);
    }

    return {
      restaurants: newRestaurants
    };
  }

  findNextRestaurants(previousLunchCycle) {
    const allRestaurants = this.restaurantsGateway.all();
    const [lastRestaurant] = previousLunchCycle.restaurants.slice(-1);

    const indexOfLastRestaurant = this.restaurantsGateway
      .all()
      .findIndex(res => res.name === lastRestaurant.name);

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
