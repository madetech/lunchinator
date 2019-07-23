const result = require("dotenv").config();

let envs;

if (!("error" in result)) {
  // Used in Dev
  envs = result.parsed;
} else {
  // Used in CI/Prod
  envs = {};
  Object(process.env).keys.map(key => (envs[key] = process.env[key]));
}

if (envs.VALID_SLACK_USER_IDS) {
  envs.VALID_SLACK_USER_IDS = envs.VALID_SLACK_USER_IDS.split(",");
}

module.exports = envs;