class DietaryLevel {
  static Great = 2;
  static Some = 1;
  static None = 0;
  static Unknown = -1;

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
