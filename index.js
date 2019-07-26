const express = require("express");
const app = express();
const port = 3000;

const config = require("./app/config");
const { InMemoryLunchCycleGateway, GoogleSheetGateway } = require("@gateways");
const {
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet
} = require("@use_cases");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/new", async (req, res) => {
  const inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
  var getNewLunchCycleRestaurants = new GetNewLunchCycleRestaurants({
    fetchRestaurantsFromGoogleSheet: new FetchRestaurantsFromGoogleSheet({
      googleSheetGateway: new GoogleSheetGateway()
    }),
    getPreviousLunchCycle: new GetPreviousLunchCycle({
      lunchCycleGateway: inMemoryLunchCycleGateway
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

  return res.send(`Next Cycle Restaurants:\n${message}`);
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function stop() {
  server.close();
}

module.exports = app;
module.exports.stop = stop;
