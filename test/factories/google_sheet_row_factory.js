class GoogleSheetRowFactory {
  static getRestaurantRow(overrides = {}) {
    const base = {
      _links: [],
      _xml: "",
      del: () => {},
      emoji: ":blush:",
      halal: "?",
      id: "sheet_url",
      meat: "great",
      notes: "",
      restaurant: "restaurant",
      save: () => {},
      vegan: "great",
      vegetarian: "some"
    };

    return { ...base, ...overrides };
  }
}

module.exports = GoogleSheetRowFactory;
