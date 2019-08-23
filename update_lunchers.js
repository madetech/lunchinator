require("module-alias/register");
const { LunchCycleService } = require("@services");

new LunchCycleService()
  .updateLunchers()()
  .then(() => {
    console.log("updated luncher reactions");
  })
  .catch(err => {
    console.log("there was a problem updating luncher reactions...");
    console.log(err);
  });
