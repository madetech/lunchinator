require("module-alias/register");
const express = require("express");
const app = express();
const port = 4390;

const { LunchCycleController } = require("@controllers");

app.use(express.urlencoded({ extended: true }));

app.use("/", LunchCycleController);

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function stop() {
  server.close();
}

module.exports = app;
module.exports.stop = stop;
