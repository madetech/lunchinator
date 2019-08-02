const express = require("express");
const router = express.Router();
const { LunchCycleService } = require("@services");
const config = require("@app/config");

const {
  PostgresLunchCycleGateway,
  GoogleSheetGateway,
  CryptoGateway,
  SlackGateway,
  PostgresSlackUserResponseGateway
} = require("@gateways");

const {
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet,
  VerifySlackRequest,
  GenerateSlackMessage,
  CreateNewLunchCycle,
  IsLunchinatorAdmin,
  FetchAllSlackUsers,
  SendDirectMessageToSlackUser,
  FetchReactionsForSlackUserResponse,
  UpdateSlackUserResponseWithReactions,
  ExportSlackUserResponseToGoogleSheet
} = require("@use_cases");

router.post("/new", async function(req, res) {
  const lunchCycleGateway = new PostgresLunchCycleGateway();

  const lunchCycleService = new LunchCycleService({
    createNewLunchCycle: new CreateNewLunchCycle({
      lunchCycleGateway: lunchCycleGateway
    }),
    verifySlackRequest: new VerifySlackRequest({
      gateway: new CryptoGateway()
    }),
    getNewLunchCycleRestaurants: new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: new FetchRestaurantsFromGoogleSheet({
        googleSheetGateway: new GoogleSheetGateway()
      }),
      getPreviousLunchCycle: new GetPreviousLunchCycle({
        lunchCycleGateway: lunchCycleGateway
      })
    }),
    generateSlackMessage: new GenerateSlackMessage(),
    isLunchinatorAdmin: new IsLunchinatorAdmin()
  });

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

  res.send(message);
});

router.post("/send", async function(req, res) {
  const slackGateway = new SlackGateway();

  const lunchCycleService = new LunchCycleService({
    fetchAllSlackUsers: new FetchAllSlackUsers({
      slackGateway: slackGateway
    }),
    sendDirectMessageToSlackUser: new SendDirectMessageToSlackUser({
      slackGateway: slackGateway,
      slackUserResponseGateway: new PostgresSlackUserResponseGateway(),
      generateSlackMessage: new GenerateSlackMessage(),
      lunchCycleGateway: new PostgresLunchCycleGateway()
    })
  });

  let users = await lunchCycleService.fetchSlackUsers();

  if (config.DEV_MESSAGE_RECEIVERS.length) {
    users = users.filter(u => config.DEV_MESSAGE_RECEIVERS.indexOf(u.profile.email) > -1);
  }

  await lunchCycleService.sendMessagesToSlackUsers(users);

  res.send("message sent to all users.");
});

router.post("/get_responses", async function(req, res) {
  const slackGateway = new SlackGateway();
  const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
  const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();

  const lunchCycle = await postgresLunchCycleGateway.getCurrent();

  const lunchCycleService = new LunchCycleService({
    fetchReactionsForSlackUserResponse: new FetchReactionsForSlackUserResponse({
      slackGateway: slackGateway
    }),
    updateSlackUserResponseWithReactions: new UpdateSlackUserResponseWithReactions({
      slackUserResponseGateway: postgresSlackUserResponseGateway,
      lunchCycleGateway: postgresLunchCycleGateway
    }),
    exportSlackUserResponsesForLunchCycleToGoogleSheet: new ExportSlackUserResponseToGoogleSheet({
      slackUserResponseGateway: postgresSlackUserResponseGateway,
      googleSheetGateway: new GoogleSheetGateway()
    })
  });

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

  res.send("Updated Google Sheet Lunch Cycles.");
});

module.exports = router;
