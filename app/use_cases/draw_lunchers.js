const config = require("@app/config");

const { LunchCycleWeek } = require("@domain");

class DrawLunchers {
  constructor({ lunchCycleGateway, slackUserResponseGateway }) {
    this.lunchCycleGateway = lunchCycleGateway;
    this.slackUserResponseGateway = slackUserResponseGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    let allLunchers = await this.slackUserResponseGateway.findAllForLunchCycle({ lunchCycle });

    const lunchCycleDraw = [];
    const allAvailables = lunchCycle.restaurants.map(r => {
      return allLunchers.filter(l => l.availableEmojis.includes(r.emoji));
    });
    lunchCycle.restaurants.forEach((restaurant, i) => {
      const lunchers = this.getLunchersForRestaurant(restaurant, allLunchers);

      lunchCycleDraw.push(
        new LunchCycleWeek({
          restaurant,
          lunchers,
          allAvailable: allAvailables[i]
        })
      );

      allLunchers = this.removeDrawnLunchers(allLunchers, lunchers, restaurant.emoji);
    });

    return {
      lunchCycleDraw: lunchCycleDraw
    };
  }

  getLunchersForRestaurant(restaurant, allLunchers) {
    const drawnLunchers = allLunchers
      .filter(l => l.availableEmojis.includes(restaurant.emoji))
      .sort((first, second) => first.availableEmojis.length - second.availableEmojis.length)
      .slice(0, config.LUNCHERS_PER_WEEK);

    return drawnLunchers.map(l => {
      return { firstName: l.firstName, email: l.email, slackUserId: l.slackUserId };
    });
  }

  removeDrawnLunchers(allLunchers, drawnLunchers, emoji) {
    const drawnLuncherIds = drawnLunchers.map(l => l.slackUserId);
    allLunchers = allLunchers.filter(l => !drawnLuncherIds.includes(l.slackUserId));
    allLunchers.forEach(l => (l.availableEmojis = l.availableEmojis.filter(e => e !== emoji)));
    return allLunchers;
  }
}

module.exports = DrawLunchers;
