require("module-alias/register");
const { LunchCycleService } = require("@services");

new LunchCycleService()
  .remindLateResponders()
  .then(() => {
    console.log("sent message to non-responders");
  })
  .catch(err => {
    console.log("there was a problem notifying non-responders...");
    console.log(err);
  });
