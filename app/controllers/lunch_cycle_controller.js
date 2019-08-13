const express = require("express");
const request = require("request");
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
  const responseURL = req.body.response_url;

  const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
  const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();
  const lunchCycleService = new LunchCycleService();
  try {
    const lunchCycle = await postgresLunchCycleGateway.getCurrent();

    const slackUserResponses = await postgresSlackUserResponseGateway.findAllForLunchCycle({
      lunchCycle
    });

    const {
      updatedSlackUserResponses
    } = await lunchCycleService.fetchReactionsFromSlackUserResponses({
      slackUserResponses
    });

    res.send({ text: "exporting user responses to google sheet..." });

    await lunchCycleService.exportResponsesToGoogleSheet({
      lunchCycle,
      slackUserResponses: updatedSlackUserResponses
    });

    request.post({
      headers: { "content-type": "application/json" },
      url: responseURL,
      json: { text: "Exported to google sheet!" }
    });
  } catch (error) {
    request.post({
      headers: { "content-type": "application/json" },
      url: responseURL,
      json: { text: "Error exporting" }
    });
  }
});

router.post("/reminder", async function(req, res) {
  const lunchCycleService = new LunchCycleService();
  await lunchCycleService.remindLateResponders();
  res.send("reminder has been sent non responders");
});

module.exports = router;
