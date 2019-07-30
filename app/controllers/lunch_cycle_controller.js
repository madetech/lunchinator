const express = require("express");
const router = express.Router();
const { LunchCycleService } = require("@services");

router.post("/new", async function(req, res) {
  console.log(req.headers);
  console.log(req.body);

  const lunchCycleService = new LunchCycleService();
  if (!lunchCycleService.verifySlackRequest(req.headers, req.body)) {
    res.send("ERROR");
  }
  const lunchCycleRestaurants = await lunchCycleService.getLunchCycleRestaurants();
  const message = lunchCycleService.getPreviewMessage(lunchCycleRestaurants);

  res.send(`Next Cycle Restaurants:\n${message}`);
});

module.exports = router;
