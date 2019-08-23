require("module-alias/register");
const { LunchCycleService } = require("@services");

new LunchCycleService()
  .sendMessageToSelectedLunchers()
  .then(() => {
    console.log("sent message to slectedl lunchers");
  })
  .catch(err => {
    console.log("there was a problem notifying non-responders...");
    console.log(err);
  });
