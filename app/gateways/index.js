module.exports = {
  InMemoryLunchCycleGateway: require("./in_memory_lunch_cycle_gateway"),
  PostgresLunchCycleGateway: require("./postgres_lunch_cycle_gateway"),
  ...require("./google_sheet_gateway")
};
