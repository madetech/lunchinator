const express = require("express");
const router = express.Router();
const { LunchCycleService } = require("@services");

const { PostgresLunchCycleGateway, GoogleSheetGateway, CryptoGateway } = require("@gateways");
const {
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet,
  VerifySlackRequest,
  GenerateSlackMessage,
  CreateNewLunchCycle,
  IsLunchinatorAdmin
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

module.exports = router;
