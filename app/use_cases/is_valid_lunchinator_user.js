const config = require("@app/config");

class IsValidLunchinatorUser {
  constructor({ user_id }) {
    this.userId = user_id;
  }

  execute() {
    return config.VALID_SLACK_USER_IDS.indexOf(this.userId) > -1;
  }
}

module.exports = IsValidLunchinatorUser;
