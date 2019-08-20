const config = require("@app/config");

class GetNewLunchCycleRestaurants {
  constructor(options) {
    this.fetchRestaurantsFromGoogleSheet = options.fetchRestaurantsFromGoogleSheet;
    this.fetchAllSlackUsers = options.fetchAllSlackUsers;
  }

  async execute({ currentLunchCycle }) {
    const fetchResponse = await this.fetchRestaurantsFromGoogleSheet.execute();
    const allSlackUsers = await this.fetchAllSlackUsers.execute();

    const restaurants = this.findNextRestaurants(
      fetchResponse.restaurants,
      currentLunchCycle,
      allSlackUsers
    );

    return { restaurants: restaurants };
  }

  findNextRestaurants(allRestaurants, previousLunchCycle, allSlackUsers) {
    const cycleLength = allSlackUsers.slackUsers.length / config.LUNCHERS_PER_WEEK;

    if (previousLunchCycle === null || !previousLunchCycle || !previousLunchCycle.restaurants) {
      return allRestaurants.slice(0, cycleLength);
    }

    const indexOfLastRestaurant = this.getIndexOfLastRestaurant(allRestaurants, previousLunchCycle);

    const nextRestaurants = allRestaurants.slice(indexOfLastRestaurant + 1);
    if (nextRestaurants.length < cycleLength) {
      // if at the end of list wrap around to the top again
      return nextRestaurants.concat(allRestaurants.slice(0, cycleLength - nextRestaurants.length));
    } else if (nextRestaurants.length > cycleLength) {
      return nextRestaurants.slice(0, cycleLength);
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
