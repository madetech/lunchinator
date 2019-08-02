require("module-alias/register");
const { Client } = require("pg");
const { SlackUserResponse } = require("@domain");
const config = require("@app/config");

class PostgresSlackUserResponseGateway {
  async findAllForLunchCycle({ lunchCycle }) {
    const client = await this._client();
    const result = await client.query({
      text: "SELECT * FROM slack_user_responses WHERE lunch_cycle_id = $1 ORDER BY slack_user_id",
      values: [lunchCycle.id]
    });
    client.end();

    return result.rows.map(r => SlackUserResponse.newFromDb(r));
  }

  async create({ slackUser, slackMessageResponse, lunchCycle }) {
    const newSlackUserResponse = {
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
          "slack_user_responses(" +
          "slack_user_id, lunch_cycle_id, email, first_name, message_channel, message_id, " +
          "available_emojis) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        values: [
          newSlackUserResponse.slack_user_id,
          newSlackUserResponse.lunch_cycle_id,
          newSlackUserResponse.email,
          newSlackUserResponse.first_name,
          newSlackUserResponse.message_channel,
          newSlackUserResponse.message_id,
          JSON.stringify(lunchCycle.available_emojis)
        ]
      })
      .finally(() => client.end());

    return SlackUserResponse.newFromDb(result.rows[0]);
  }

  async save({ slackUserResponse }) {
    const client = await this._client();
    const result = await client
      .query({
        text:
          "UPDATE slack_user_responses SET available_emojis = $1 " +
          "WHERE slack_user_id = $2 AND lunch_cycle_id = $3 RETURNING *",
        values: [
          JSON.stringify(slackUserResponse.availableEmojis),
          slackUserResponse.slackUserId,
          slackUserResponse.lunchCycleId
        ]
      })
      .finally(() => client.end());

    if (result.rows[0]) {
      return SlackUserResponse.newFromDb(result.rows[0]);
    }

    return null;
  }

  async count() {
    const client = await this._client();
    const result = await client.query("SELECT COUNT(*) as count FROM slack_user_responses");
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
