class GenerateReminderMessage {
  execute({ nonResponderId }) {
    return {
      text: `Hi <@${nonResponderId}>, please respond with your preferences for the lunchers draw!`
    };
  }
}
module.exports = GenerateReminderMessage;
