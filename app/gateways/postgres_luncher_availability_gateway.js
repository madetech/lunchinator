const { Client } = require("pg");

class PostgresLuncherAvailabilityGateway {
  constructor(dbconfig) {
    this.dbconfig = dbconfig
  }
  
  async addAvailability({lunch_cycle_id, slack_user_id, restaurant_name}) { // Is adding what we want
    const client = await this._client()
    await client.query({
      text: "INSERT INTO availability(lunch_cycle_id, slack_user_id, available, restaurant_name) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING",
      values: [
        lunch_cycle_id,
        slack_user_id,
        true,
        restaurant_name
      ]
    })
    .finally(() => client.end());
  }
  
  async getAvailabilities({lunch_cycle_id}) {  // Is returning what we want
    const client = await this._client()
    const result = await client.query({
      text: "SELECT * FROM availability WHERE lunch_cycle_id = $1",
      values: [lunch_cycle_id]
    })
    client.end()
    return result.rows
  }
  
  async getAvailableUsers({lunch_cycle_id}) {
    const client = await this._client()
    const result = await client.query({
      text: 
      "SELECT availability.slack_user_id, availability.lunch_cycle_id, lunchers.first_name, availability.restaurant_name, availability.available, lunchers.email " + 
      "FROM availability " +
      "LEFT JOIN lunchers " +
      "ON availability.slack_user_id = lunchers.slack_user_id " +
      "AND availability.lunch_cycle_id = lunchers.lunch_cycle_id " +
      "WHERE availability.lunch_cycle_id = $1;",
      values: [lunch_cycle_id]
    })
    client.end()
    return result.rows
  }
  
  async _client() {
    const client = new Client(this.dbconfig);
    await client.connect();

    return client;
  }
}
module.exports = PostgresLuncherAvailabilityGateway;
