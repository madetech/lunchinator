const config = require("@app/config");

class IsLunchinatorAdmin {
  execute({ userId }) {
    const isValid = config.VALID_SLACK_USER_IDS.indexOf(userId) > -1;
    return { isValid };
  }
}

module.exports = IsLunchinatorAdmin;
