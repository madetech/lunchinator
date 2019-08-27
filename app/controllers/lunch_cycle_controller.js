const express = require("express");
const router = express.Router();
const { LunchCycleService, AuthService } = require("@services");
const config = require("@app/config");

router.post("/new", async function(req, res) {
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!authService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  const lunchCycleService = new LunchCycleService();

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
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!authService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  const lunchCycleService = new LunchCycleService();

  let users = await lunchCycleService.fetchSlackUsers();

  // limit the users receiving the message in dev so we dont spam em all!
  if (config.DEV_MESSAGE_RECEIVERS.length) {
    users = users.filter(u => config.DEV_MESSAGE_RECEIVERS.indexOf(u.profile.email) > -1);
  }

  await lunchCycleService.sendMessagesToSlackUsers(users);

  res.send("message sent to all users.");
});

router.post("/draw", async function(req, res) {
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!authService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  try {
    const lunchCycleService = new LunchCycleService();

    await lunchCycleService.updateLunchers();
    await lunchCycleService.doLunchersDraw();
  } catch (err) {
    console.log(err);
  }

  res.send("draw complete.");
});

router.post("/send_confirmation", async function(req, res) {
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!authService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  try {
    const lunchCycleService = new LunchCycleService();

    await lunchCycleService.sendMessageToSelectedLunchers();

    res.send("confirmation messages sent.");
  } catch (err) {
    console.log(err);
    res.send("error sending confirmation messages.");
  }
});

module.exports = router;
