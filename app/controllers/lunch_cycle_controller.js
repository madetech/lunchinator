const express = require("express");
const router = express.Router();
const { LunchCycleService } = require("@services");

const {
  PostgresLunchCycleGateway,
  InMemoryLunchCycleGateway,
  GoogleSheetGateway,
  CryptoGateway
} = require("@gateways");
const {
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet,
  VerifySlackRequest,
  GenerateSlackPreviewMessage,
  CreateNewLunchCycle,
  IsValidLunchinatorUser
} = require("@use_cases");

router.post("/new", async function(req, res) {
  const lunchCycleGateway = new InMemoryLunchCycleGateway();

  const lunchCycleService = new LunchCycleService({
    createNewLunchCycle: new CreateNewLunchCycle({
      lunchCycleGateway: lunchCycleGateway,
      isValidLunchinatorUser: new IsValidLunchinatorUser()
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
    generateSlackPreviewMessage: new GenerateSlackPreviewMessage()
  });

  if (!lunchCycleService.verifyRequest(req.headers, req.body)) {
    res.send("error verifying slack request.");
  }

  // want to move user verification in here

  const lunchCycleRestaurants = await lunchCycleService.getLunchCycleRestaurants();

  const createResponse = await lunchCycleService.createLunchCycle({
    userId: req.body.user_id,
    restaurants: lunchCycleRestaurants
  });

  if (createResponse.error) {
    res.send(createResponse.error);
  }

  const message = lunchCycleService.getPreviewMessage(createResponse.lunchCycle);

  res.send(message);
});

module.exports = router;
