const express = require("express");
const router = express.Router();

const { InMemoryLunchCycleGateway, GoogleSheetGateway } = require("@gateways");
const {
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet
} = require("@use_cases");

router.post("/new", async function(req, res) {
  console.log(req.headers);
  console.log(req.statusCode);
  console.log(req.body);

  const getNewLunchCycleRestaurants = new GetNewLunchCycleRestaurants({
    fetchRestaurantsFromGoogleSheet: new FetchRestaurantsFromGoogleSheet({
      googleSheetGateway: new GoogleSheetGateway()
    }),
    getPreviousLunchCycle: new GetPreviousLunchCycle({
      lunchCycleGateway: new InMemoryLunchCycleGateway()
    })
  });

  const lastRestaurantInLastLunchCycle = null;
  const getNewLunchCycleRestaurantsResponse = await getNewLunchCycleRestaurants.execute(
    lastRestaurantInLastLunchCycle
  );

  const message = getNewLunchCycleRestaurantsResponse.restaurants
    .map(restaurants => {
      return `${restaurants.emoji} ${restaurants.name}`;
    })
    .join("\n");

  res.send(`Next Cycle Restaurants:\n${message}`);
});

module.exports = router;
