const config = "@app/config";
const { LunchCycleWeek } = require("@domain");

class DrawLunchers {
  constructor({ lunchCycleGateway, slackUserResponseGateway }) {
    this.lunchCycleGateway = lunchCycleGateway;
    this.slackUserResponseGateway = slackUserResponseGateway;
  }

  async execute() {
    const lunchCycle = await this.lunchCycleGateway.getCurrent();
    const allLunchers = await this.slackUserResponseGateway.findAllForLunchCycle({ lunchCycle });

    const weeks = [];

    lunchCycle.restaurants.forEach(restaurant => {
      const lunchers = this.getLunchersForRestaurant(restaurant, allLunchers);

      weeks.push(
        new LunchCycleWeek({
          restaurant,
          lunchers
        })
      );
    });

    return {
      weeks
    };
  }

  getLunchersForRestaurant(restaurant, allLunchers) {
    const availableLunchers = allLunchers
      .filter(l => l.availableEmojis.includes(restaurant.emoji))
      .sort((a, b) => {
        // sort by how many restaurants luncher has available
        return a.availableEmojis.length < b.availableEmojis.length ? 1 : 1;
      })
      .slice(0, 1);

    // NEED TO USE THIS IN THE SLICE
    console.log(config.LUNCHERS_PER_WEEK);

    allLunchers.forEach(
      l => (l.availableEmojis = l.availableEmojis.filter(e => e !== restaurant.emoji))
    );

    return availableLunchers.map(l => {
      return { firstName: l.firstName, email: l.email, slackUserId: l.slackUserId };
    });
  }
}

module.exports = DrawLunchers;
