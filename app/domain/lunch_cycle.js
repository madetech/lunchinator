require("module-alias/register");
const Restaurant = require("./restaurant");

class LunchCycle {
  constructor(options = {}) {
    this.id = options.id;
    this.restaurants = options.restaurants || [];
    this.starts_at = options.starts_at;
    this.created_at = options.created_at;
    this.updated_at = options.updated_at;
    this.is_sent = options.is_sent;

    if (this.restaurants.length > 0 && !(this.restaurants[0] instanceof Restaurant)) {
      this.restaurants = this.restaurants.map(r => new Restaurant(r));
    }
  }
}

module.exports = LunchCycle;
