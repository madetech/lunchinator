require("module-alias/register");
const express = require("express");
const app = express();
var serveStatic = require("serve-static");
var bodyParser = require("body-parser");

const port = process.env.PORT || 4390;

const { LunchCycleController, UiController } = require("@controllers");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// compiled vue
app.use(serveStatic(__dirname + "/dist"));

app.use("/ui/", UiController);
app.use("/", LunchCycleController);

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function stop() {
  server.close();
}

module.exports = app;
module.exports.stop = stop;
