const express = require("express");
const router = express.Router();
const { LunchCycleService } = require("@services");
const config = require("@app/config");
const { PostgresLunchCycleGateway, PostgresSlackUserResponseGateway } = require("@gateways");

router.post("/new", async function(req, res) {
  const lunchCycleService = new LunchCycleService();

  if (!lunchCycleService.verifyRequest(req.headers, req.body)) {
    return res.send("error verifying slack request.");
  }

  if (!lunchCycleService.isAdmin(req.body.user_id)) {
    return res.send("sorry, you are not authorised to do this.");
  }

  const lunchCycleRestaurants = await lunchCycleService.getLunchCycleRestaurants();

  const createResponse = await lunchCycleService.createLunchCycle({
    restaurants: lunchCycleRestaurants
  });

  if (createResponse.error) {
    return res.send(createResponse.error);
  }

  const message = lunchCycleService.getPreviewMessage(createResponse.lunchCycle);

console.log(message);

  res.json(message);
});

router.post("/send", async function(req, res) {
  const lunchCycleService = new LunchCycleService();

  let users = await lunchCycleService.fetchSlackUsers();

  if (config.DEV_MESSAGE_RECEIVERS.length) {
    users = users.filter(u => config.DEV_MESSAGE_RECEIVERS.indexOf(u.profile.email) > -1);
  }

  await lunchCycleService.sendMessagesToSlackUsers(users);

  res.send("message sent to all users.");
});

router.post("/export", async function(req, res) {
  const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
  const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();
  const lunchCycleService = new LunchCycleService();

  const lunchCycle = await postgresLunchCycleGateway.getCurrent();

  const slackUserResponses = await postgresSlackUserResponseGateway.findAllForLunchCycle({
    lunchCycle
  });

  const {
    updatedSlackUserResponses
  } = await lunchCycleService.fetchReactionsFromSlackUserResponses({
    slackUserResponses
  });

  await lunchCycleService.exportResponsesToGoogleSheet({
    lunchCycle,
    slackUserResponses: updatedSlackUserResponses
  });

  res.send("exported user responses to google sheet.");
});

module.exports = router;
