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
      text: "INSERT INTO lunch_cycles(restaurants) VALUES($1) RETURNING *",
      values: [JSON.stringify(lunchCycle.restaurants)]
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

  async findPrevious(lunchCycle) {
    const client = await this._client();
    const result = await client.query({
      text: "SELECT * FROM lunch_cycles WHERE id < $1 ORDER BY id DESC LIMIT 1",
      values: [lunchCycle.id]
    });
    client.end();

    let founcLunchCycle = null;
    if (result.rows.length > 0) {
      founcLunchCycle = new LunchCycle(result.rows[0]);
    }

    return founcLunchCycle;
  }

  async _client() {
    const client = new Client(config.db);
    await client.connect();

    return client;
  }
}

module.exports = PostgresLunchCycleGateway;
