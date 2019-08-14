require("module-alias/register");
const { LunchCycleService } = require("@services");

const lunchCycleService = new LunchCycleService();
await lunchCycleService.remindLateResponders();
