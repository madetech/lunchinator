require("module-alias/register");
const { Client } = require("pg");
const { Luncher } = require("@domain");
const config = require("@app/config");

class PostgresSlackUserResponseGateway {
  async create({ slackUser, slackMessageResponse, lunchCycle }) {
    const luncher = {
      slack_user_id: slackUser.id,
      lunch_cycle_id: lunchCycle.id,
      email: slackUser.profile.email,
      first_name: slackUser.profile.first_name,
      message_channel: slackMessageResponse.channel,
      message_id: slackMessageResponse.ts,
      available_emojis: []
    };

    const client = await this._client();
    const result = await client
      .query({
        text:
          "INSERT INTO " +
          "lunchers(" +
          "slack_user_id, lunch_cycle_id, email, first_name, message_channel, message_id, " +
          "available_emojis) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        values: [
          luncher.slack_user_id,
          luncher.lunch_cycle_id,
          luncher.email,
          luncher.first_name,
          luncher.message_channel,
          luncher.message_id,
          JSON.stringify(lunchCycle.available_emojis)
        ]
      })
      .finally(() => client.end());

    return Luncher.newFromDb(result.rows[0]);
  }

  async count() {
    const client = await this._client();
    const result = await client.query("SELECT COUNT(*) as count FROM lunchers");
    client.end();

    return parseInt(result.rows[0].count, 10);
  }


  async _client() {
    const client = new Client(config.db);
    await client.connect();

    return client;
  }
}

module.exports = PostgresSlackUserResponseGateway;
