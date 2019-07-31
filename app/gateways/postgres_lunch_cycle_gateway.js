require("module-alias/register");
const { Client } = require("pg");
const { LunchCycle } = require("@domain");
const config = require("@app/config");

class PostgresLunchCycleGateway {
  async count() {
    const client = await this._client();
    const result = await client.query("SELECT COUNT(*) as count FROM lunch_cycles");
    client.end();

    return parseInt(result.rows[0].count, 10);
  }

  async create(lunchCycle) {
    const client = await this._client();
    const result = await client.query({
      text: "INSERT INTO lunch_cycles(restaurants, starts_at) VALUES($1,$2) RETURNING *",
      values: [JSON.stringify(lunchCycle.restaurants), lunchCycle.starts_at]
    });
    client.end();

    return new LunchCycle(result.rows[0]);
  }

  async all() {
    const client = await this._client();
    const result = await client.query("SELECT * FROM lunch_cycles");
    client.end();

    return result.rows.map(r => new LunchCycle(r));
  }

  async findPrevious() {
    const client = await this._client();
    const result = await client.query("SELECT * FROM lunch_cycles ORDER BY id DESC LIMIT 1");
    client.end();

    let foundLunchCycle = null;
    if (result.rows.length > 0) {
      foundLunchCycle = new LunchCycle(result.rows[0]);
    }

    return foundLunchCycle;
  }

  async _client() {
    const client = new Client(config.db);
    await client.connect();

    return client;
  }
}

module.exports = PostgresLunchCycleGateway;
