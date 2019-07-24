const config = require("@app/config");

class IsValidLunchinatorUser {
  execute({ userId }) {
    const isValid = config.VALID_SLACK_USER_IDS.indexOf(userId) > -1;

    return { isValid };
  }
}

module.exports = IsValidLunchinatorUser;
