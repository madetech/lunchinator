module.exports = {
  InMemoryLunchCycleGateway: require("./in_memory_lunch_cycle_gateway"),
  PostgresLunchCycleGateway: require("./postgres_lunch_cycle_gateway"),
  ...require("./slack_gateway"),
  ...require("./google_sheet_gateway"),
  CryptoGateway: require("./crypto_gateway"),
  InMemorySlackUserResponseGateway: require("./in_memory_slack_user_gateway"),
  PostgresSlackUserResponseGateway: require("./postgres_slack_user_gateway"),
  PostgresLunchCycleDrawGateway: require("./postgres_lunch_cycle_draw_gateway"),
  PostgresLuncherAvailabilityGateway: require("./postgres_luncher_availability_gateway")
};
