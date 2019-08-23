const express = require("express");
const router = express.Router();
const { LunchCycleService } = require("@services");
const config = require("@app/config");

router.post("/new", async function(req, res) {
  const lunchCycleService = new LunchCycleService();

  if (!lunchCycleService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!lunchCycleService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  const lunchCycleRestaurants = await lunchCycleService.getLunchCycleRestaurants();

  const response = await lunchCycleService.createLunchCycle({
    restaurants: lunchCycleRestaurants
  });

  if (response.error) {
    return res.send(response.error);
  }

  const message = await lunchCycleService.getPreviewMessage();

  res.json(message);
});

router.post("/availability", async function(req, res) {
  const lunchCycleService = new LunchCycleService();

  if (!lunchCycleService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!lunchCycleService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  let users = await lunchCycleService.fetchSlackUsers();

  // limit the users receiving the message in dev so we dont spam em all!
  if (config.DEV_MESSAGE_RECEIVERS.length) {
    users = users.filter(u => config.DEV_MESSAGE_RECEIVERS.indexOf(u.profile.email) > -1);
  }

  await lunchCycleService.sendMessagesToSlackUsers(users);

  res.send("message sent to all users.");
});

router.post("/draw", async function(req, res) {
  try {
    const lunchCycleService = new LunchCycleService();

    if (!lunchCycleService.verifyRequest(req.headers, req.body)) {
      return res.send("error verifying slack request.");
    }

    if (!lunchCycleService.isAdmin(req.body.user_id)) {
      return res.send("sorry, you are not authorised to do this.");
    }

    await lunchCycleService.updateLunchers();
    await lunchCycleService.doLunchersDraw();
  } catch (err) {
    console.log(err);
  }

  res.send("draw complete.");
});

router.post("/send_confirmation", async function(req, res) {
  const lunchCycleService = new LunchCycleService();
  lunchCycleService
    .sendMessageToSelectedLunchers()
    .then(() => {
      console.log("sent message to slectedl lunchers");
    })
    .catch(err => {
      console.log("there was a problem notifying non-responders...");
      console.log(err);
    });
});

router.get("/currentdraw", async function(req, res) {
  if (!req.query.token || req.query.token !== config.VUE_APP_LUNCH_CYCLE_API_TOKEN) {
    return res.status(403).send("soz");
  }

  const lunchCycleService = new LunchCycleService();
  const lunchCycleDraw = await lunchCycleService.getLatestLunchCycleDraw();
  res.json(lunchCycleDraw);
});

router.get("/alllunchers", async function(req, res) {
  if (!req.query.token || req.query.token !== config.VUE_APP_LUNCH_CYCLE_API_TOKEN) {
    return res.status(403).send("soz");
  }

  const lunchCycleService = new LunchCycleService();
  const allLunchers = await lunchCycleService.fetchSlackUsers();
  res.json(allLunchers);
});

router.post("/update", async function(req, res) {
  if (!req.query.token || req.query.token !== config.VUE_APP_LUNCH_CYCLE_API_TOKEN) {
    return res.status(403).send("soz");
  }

  const lunchCycleService = new LunchCycleService();
  await lunchCycleService.updateDraw(req.body);
  return res.sendStatus(200);
});

module.exports = router;
