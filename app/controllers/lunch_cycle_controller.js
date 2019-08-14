const express = require("express");
const request = require("request");
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

router.post("/send", async function(req, res) {
  const lunchCycleService = new LunchCycleService();

  let users = await lunchCycleService.fetchSlackUsers();

  // limit the users receiving the message in dev so we dont spam em all!
  if (config.DEV_MESSAGE_RECEIVERS.length) {
    users = users.filter(u => config.DEV_MESSAGE_RECEIVERS.indexOf(u.profile.email) > -1);
  }

  await lunchCycleService.sendMessagesToSlackUsers(users);

  res.send("message sent to all users.");
});

router.post("/export", async function(req, res) {
  res.send({ text: "exporting user responses to google sheet..." });

  try {
    const lunchCycleService = new LunchCycleService();
    await lunchCycleService.updateLunchers();
    await lunchCycleService.exportLunchers();
    postSlackResponse(req.body.response_url, "exported to google sheet!");
  } catch (err) {
    console.log(err);
    postSlackResponse(
      req.body.response_url,
      "sorry, there was an error exporting. please try again."
    );
  }
});

router.post("/reminder", async function(req, res) {
  const lunchCycleService = new LunchCycleService();
  await lunchCycleService.remindLateResponders();
  res.send("reminder has been sent to non responders");
});

function postSlackResponse(url, text) {
  request.post({
    headers: { "content-type": "application/json" },
    url: url,
    json: { text }
  });
}

module.exports = router;
