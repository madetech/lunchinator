const result = require("dotenv").config();
const dbConfig = require("config");

let envs;

if (!("error" in result)) {
  // Used in Dev
  envs = result.parsed;
} else {
  // Used in CI/Prod
  envs = {};
  Object.keys(process.env).map(key => (envs[key] = process.env[key]));
}

if (envs.VALID_SLACK_USER_IDS) {
  envs.VALID_SLACK_USER_IDS = envs.VALID_SLACK_USER_IDS.split(",");
}

envs.db = {
  user: envs.PGUSER,
  host: envs.PGHOST,
  database: dbConfig.db.database,
  password: envs.PGPASSWORD,
  port: envs.PGPORT
};

module.exports = envs;
