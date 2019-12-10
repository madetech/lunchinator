const { Client } = require("pg");
const { Luncher } = require("@domain");

class PostgresLuncherAvailabilityGateway {
  constructor(dbconfig) {
    this.dbconfig = dbconfig;
  }

  async addAvailability({ lunch_cycle_id, slack_user_id, restaurant_name, available }) {
    //Sets available to true or false
    // Is adding what we want
    const client = await this._client();
    await client
      .query({
        text:
          // "INSERT INTO availability(lunch_cycle_id, slack_user_id, available, restaurant_name) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING",
          "INSERT INTO availability(lunch_cycle_id, slack_user_id, available, restaurant_name) " +
          "VALUES ($1, $2, $3, $4) " +
          "ON CONFLICT(lunch_cycle_id, slack_user_id, restaurant_name) " +
          "DO UPDATE SET available = $3;",
        values: [lunch_cycle_id, slack_user_id, available, restaurant_name]
      })
      .finally(() => client.end());
  }

  async getAvailabilities({ lunch_cycle_id }) {
    //Everyone who has replied yes or no at least once
    // Is returning what we want
    const client = await this._client();
    const result = await client.query({
      text: "SELECT * FROM availability WHERE lunch_cycle_id = $1",
      values: [lunch_cycle_id]
    });
    client.end();
    return result.rows;
  }

  async getAvailableUsers({ lunch_cycle_id }) {
    // Everyone who could be a luncher AKA every MadeTech human
    const client = await this._client();
    const result = await client.query({
      text:
        "SELECT availability.slack_user_id, availability.lunch_cycle_id, lunchers.first_name, availability.restaurant_name, availability.available, lunchers.email " +
        "FROM availability " +
        "LEFT JOIN lunchers " +
        "ON availability.slack_user_id = lunchers.slack_user_id " +
        "AND availability.lunch_cycle_id = lunchers.lunch_cycle_id " +
        "WHERE availability.lunch_cycle_id = $1;",
      values: [lunch_cycle_id]
    });
    client.end();
    return result.rows.map(luncher => {
      return Luncher.newFromDb(luncher);
    });
  }

  async getUsersWithoutResponse({ lunch_cycle_id }) {
    const client = await this._client();
    const result = await client.query({
      text:
        "SELECT slack_user_id " +
        "FROM lunchers WHERE lunchers.lunch_cycle_id = $1 AND slack_user_id NOT IN (" +
        "SELECT slack_user_id FROM availability WHERE lunch_cycle_id = $1" +
        ");",
      values: [lunch_cycle_id]
    });
    client.end();
    return result.rows.map(luncher => {
      return luncher.slack_user_id;
    });
  }

  async _client() {
    const client = new Client(this.dbconfig);
    await client.connect();

    return client;
  }
}
module.exports = PostgresLuncherAvailabilityGateway;
