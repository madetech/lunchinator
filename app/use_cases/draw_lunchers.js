const config = require("@app/config");

const { LunchCycleWeek } = require("@domain");

class DrawLunchers {
  constructor({ lunchCycleGateway, postgresLuncherAvailabilityGateway }) {
    this.lunchCycleGateway = lunchCycleGateway;
    this.postgresLuncherAvailabilityGateway = postgresLuncherAvailabilityGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    let allRespondedUsers = await this.postgresLuncherAvailabilityGateway.getAvailableUsers({ lunch_cycle_id: lunchCycle.id });
    let totalAvailabilitiesHash = this.getTotalAvailabilitiesHash(allRespondedUsers)

    const lunchCycleDraw = [];
    lunchCycle.restaurants.forEach((restaurant) => {
    const availableThisWeek = allRespondedUsers.filter(a => a.restaurantName == restaurant.name)
    const lunchers = this.getLunchersForRestaurant(availableThisWeek, totalAvailabilitiesHash);

      lunchCycleDraw.push(
        new LunchCycleWeek({
          restaurant,
          lunchers, // array of luncher id 
          allAvailable: availableThisWeek
        })
      );

      allRespondedUsers = this.removeDrawnLunchers(allRespondedUsers, lunchers, restaurant.name);
      totalAvailabilitiesHash = this.reducetotalAvailabilities(availableThisWeek, totalAvailabilitiesHash)
    });
    //save current draw in gateway using create function
    return {
      lunchCycleDraw: lunchCycleDraw
    };
  }
  
  getTotalAvailabilitiesHash(allRespondedUsers) {  // Method just for scoring interest score
    let totalAvailabilitiesHash = {}
    allRespondedUsers.forEach((user) => {
      if (totalAvailabilitiesHash.hasOwnProperty(user.slackUserId)) {
        totalAvailabilitiesHash[user.slackUserId] += 1         
      } else {
        totalAvailabilitiesHash[user.slackUserId] = 1;                                        
      }
    });
  
    return totalAvailabilitiesHash
  }

  getLunchersForRestaurant(availableThisWeek, totalAvailabilitiesHash) { // This represents the 8 Lunchers for that cycle??
    const drawnLunchers = availableThisWeek
    .sort((first, second) => totalAvailabilitiesHash[first.slackUserId] - totalAvailabilitiesHash[second.slackUserId])
    .slice(0, config.LUNCHERS_PER_WEEK);
    
    return drawnLunchers.map(l => {
      return { realName: l.realName, email: l.email, slackUserId: l.slackUserId };
    });
  }

  removeDrawnLunchers(allRespondedUsers, drawnLunchers, restaurantName) { 
    const drawnLuncherIds = drawnLunchers.map(l => l.slackUserId);
    allRespondedUsers = allRespondedUsers.filter(l => !drawnLuncherIds.includes(l.slackUserId));
    // lower totalAvailabilities for non chosen users
     // i.e totalAvailabilities[user.id]--
    return allRespondedUsers;
  }
  
  reducetotalAvailabilities(availableThisWeek, totalAvailabilitiesHash) {
    availableThisWeek.forEach((user) => {
      totalAvailabilitiesHash[user.slackUserId] -= 1;
    })
    return totalAvailabilitiesHash
  }
}

module.exports = DrawLunchers;
