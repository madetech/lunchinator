const moment = require("moment");
class GenerateReminderMessage {
  execute({ slackUserId }) {
    return {
      text: `Hi <@${slackUserId}>, please respond with your prefrences for the lunchers draw!`
    };
  }
}
module.exports = GenerateReminderMessage;
