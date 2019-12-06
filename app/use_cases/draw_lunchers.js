const config = require("@app/config");

const { LunchCycleWeek } = require("@domain");

class DrawLunchers {
  constructor({ lunchCycleGateway, postgresLuncherAvailabilityGateway }) {
    this.lunchCycleGateway = lunchCycleGateway;
    this.postgresLuncherAvailabilityGateway = postgresLuncherAvailabilityGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    let allRespondedUsers = await this.postgresLuncherAvailabilityGateway.getAvailableUsers({ lunchCycle });
    console.log("********************** AllRespondedUsers:", allRespondedUsers)
    
    const totalAvailabilitiesHash = this.getTotalAvailabilitiesHash(allRespondedUsers)

    const lunchCycleDraw = [];
    lunchCycle.restaurants.forEach((restaurant, i) => {
    const lunchers = this.getLunchersForRestaurant(restaurant, allRespondedUsers, totalAvailabilitiesHash);

      lunchCycleDraw.push(
        new LunchCycleWeek({
          restaurant,
          lunchers,
          allAvailable: allRespondedUsers[i]
        })
      );

      allRespondedUsers = this.removeDrawnLunchers(allRespondedUsers, lunchers, restaurant.name);
      // allRespondedUsers = this.reducetotalAvailabilities(allRespondedUsers)
    });
      // console.log("^^^^^^^^^^LCD: ",lunchCycleDraw)
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

  getLunchersForRestaurant(restaurant, allRespondedUsers, totalAvailabilitiesHash) { // This represents the 8 Lunchers for that cycle??
        const drawnLunchers = allRespondedUsers
      .filter(a => a.restaurant_name == restaurant.name)
      .sort((first, second) => totalAvailabilitiesHash[first.slackUserId] - totalAvailabilitiesHash[second.slackUserId])
      .slice(0, config.LUNCHERS_PER_WEEK);
    return drawnLunchers.map(l => {
      return { first_name: l.first_name, email: l.email, slack_user_id: l.slack_user_id };
    });
  }

  removeDrawnLunchers(allRespondedUsers, drawnLunchers, restaurant_name) { 
    const drawnLuncherIds = drawnLunchers.map(l => l.slack_user_id);
    allRespondedUsers = allRespondedUsers.filter(l => !drawnLuncherIds.includes(l.slack_user_id));
    // lower totalAvailabilities for non chosen users
     // i.e totalAvailabilities[user.id]--
    return allRespondedUsers;
  }
  
  reducetotalAvailabilities(allRespondedUsers) { //Why reduce points if they are being removed from available list?
    Object.keys(allRespondedUsers).map(function(key, index) {
      allRespondedUsers[key] -= 1;
    });
    return allRespondedUsers
  }
}

module.exports = DrawLunchers;
