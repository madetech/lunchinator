require("module-alias/register");
const { Client } = require("pg");
const config = require("@app/config");
const { LunchCycleWeek } = require("@app/domain");

class PostgresLunchCycleDrawGateway {
  async create(lunchCycleId, lunchCycleDraw) {
    const client = await this._client();
    await client
      .query({
        text: "INSERT INTO lunch_cycle_draws(lunch_cycle_id, draw) VALUES($1,$2) RETURNING *",
        values: [lunchCycleId, JSON.stringify(lunchCycleDraw)]
      })
      .finally(() => client.end());
  }

  async getByLunchCycleId(lunchCycleId) {
    const client = await this._client();
    const result = await client.query({
      text: "SELECT * FROM lunch_cycle_draws WHERE lunch_cycle_id = $1 ORDER BY id DESC LIMIT 1",
      values: [lunchCycleId]
    });
    client.end();

    if (result.rows[0]) {
      return result.rows[0].draw;
    }
  }

  async _client() {
    const client = new Client(config.db);
    await client.connect();
    return client;
  }
}

module.exports = PostgresLunchCycleDrawGateway;
