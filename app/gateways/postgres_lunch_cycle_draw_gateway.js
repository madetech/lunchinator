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

  async getCurrent() {
    const client = await this._client();
    const result = await client
      .query({
        text: "SELECT * FROM lunch_cycle_draws ORDER BY id DESC LIMIT 1"
      })
      .finally(() => client.end());

    if (result.rows[0]) {
      return result.rows[0].draw;
    }
  }

  async update(lunchCycleDraw) {
    const client = await this._client();
    await client
      .query({
        text:
          "UPDATE lunch_cycle_draws set draw = $1, updated_at=(SELECT now()::timestamp with time zone::timestamp) where id = (SELECT max(id) FROM lunch_cycle_draws)",
        values: [JSON.stringify(lunchCycleDraw)]
      })
      .catch(err => console.log(err))
      .finally(() => client.end());
  }

  async _client() {
    const client = new Client(config.db);
    await client.connect();
    return client;
  }
}

module.exports = PostgresLunchCycleDrawGateway;
