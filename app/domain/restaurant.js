class Restaurant {
  constructor(options = {}) {
    this.name = options.name;
    this.dietaries = options.dietaries;
    this.notes = options.notes;
    this.emoji = options.emoji;
    this.direction = options.direction;
    this.date = options.date;
  }
}

module.exports = Restaurant;
