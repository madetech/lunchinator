const config = require("@app/config");

class IsValidLunchinatorUser {
  constructor({ user_id }) {
    this.userId = user_id;
  }

  execute() {
    const isValid = config.VALID_SLACK_USER_IDS.indexOf(this.userId) > -1;

    return { isValid };
  }
}

module.exports = IsValidLunchinatorUser;
