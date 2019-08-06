class DietaryLevel {
  static Great = ":green_heart:";
  static Some = ":orange_heart:";
  static None = ":broken_heart:";
  static Unknown = ":question:";

  static getLevel(levelAsString) {
    switch (levelAsString.toLowerCase()) {
      case "great": {
        return DietaryLevel.Great;
      }
      case "some": {
        return DietaryLevel.Some;
      }
      case "none": {
        return DietaryLevel.None;
      }
      default: {
        return DietaryLevel.Unknown;
      }
    }
  }
}

module.exports = DietaryLevel;
