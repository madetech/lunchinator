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

router.post("/testnew", async function(req, res) {
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

router.post("/testavailability", async function(req, res) {
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


router.post("/send_reminder", async function(req, res) {
  const lunchCycleService = new LunchCycleService();
  lunchCycleService
    .remindLateResponders()
    .then(() => console.log("sent a reminder to late responders"))
    .catch(err => {
      console.log("there is a problem with sending reminders");
      console.log(err);
    });
  ``;
});

router.post("/testsend_reminder", async function(req, res) {
  const lunchCycleService = new LunchCycleService();
  lunchCycleService
    .remindLateResponders()
    .then(() => console.log("sent a reminder to late responders"))
    .catch(err => {
      console.log("there is a problem with sending reminders");
      console.log(err);
    });
  ``;
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

    await lunchCycleService.doLunchersDraw();
  } catch (err) {
    console.log(err);
  }

  res.send("draw complete.");
});

router.post("/testdraw", async function(req, res) {
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!authService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  try {
    const lunchCycleService = new LunchCycleService();

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

router.post("/testsend_confirmation", async function(req, res) {
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

router.post("/send_announcement", async function(req, res) {
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!authService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  const lunchCycleService = new LunchCycleService();
  lunchCycleService
    .sendToAnnouncement()
    .then(() => {
      res.send("sent message to announcements channel");
    })
    .catch(err => {
      res.send("there was a problem sending the announcement...");
      console.log(err);
    });
});

router.post("/testsend_announcement", async function(req, res) {
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!authService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  const lunchCycleService = new LunchCycleService();
  lunchCycleService
    .sendToAnnouncement()
    .then(() => {
      res.send("sent message to announcements channel");
    })
    .catch(err => {
      res.send("there was a problem sending the announcement...");
      console.log(err);
    });
});

router.post("/interactive_element", async function(req, res) {
  const authService = new AuthService();

  if (!authService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }
  payload = JSON.parse(req.body.payload)
  new LunchCycleService().recordAttendance(payload)

  res.sendStatus(200)
});


module.exports = router;
