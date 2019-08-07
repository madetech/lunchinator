require("module-alias/register");
const { Client } = require("pg");
const { LunchCycle } = require("@domain");
const config = require("@app/config");

class PostgresLunchCycleGateway {
  async findById(wantedId) {
    const client = await this._client();
    const result = await client
      .query({
        text: "SELECT * FROM lunch_cycles WHERE id = $1",
        values: [wantedId]
      })
      .finally(() => client.end());

    if (result.rows[0]) {
      return new LunchCycle(result.rows[0]);
    }

    return null;
  }

  async count() {
    const client = await this._client();
    const result = await client.query("SELECT COUNT(*) as count FROM lunch_cycles");
    client.end();

    return parseInt(result.rows[0].count, 10);
  }

  async create(lunchCycle) {
    const client = await this._client();
    const result = await client.query({
      text:
        "INSERT INTO lunch_cycles(restaurants, starts_at, is_sent) VALUES($1,$2,$3) RETURNING *",
      values: [JSON.stringify(lunchCycle.restaurants), lunchCycle.starts_at, false]
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
    const result = await client.query(
      "SELECT * FROM lunch_cycles ORDER BY created_at DESC LIMIT 2"
    );
    client.end();

    let foundLunchCycle = null;
    if (result.rows.length > 0) {
      foundLunchCycle = new LunchCycle(result.rows[1]);
    }

    console.log(foundLunchCycle);
    return foundLunchCycle;
  }

  async getCurrent() {
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
