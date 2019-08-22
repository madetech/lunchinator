require("module-alias/register");
const express = require("express");
const app = express();
var serveStatic = require("serve-static");

const port = process.env.PORT || 4390;

const { LunchCycleController } = require("@controllers");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.urlencoded({ extended: true }));

// compiled vue
app.use(serveStatic(__dirname + "/dist"));

app.use("/", LunchCycleController);

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function stop() {
  server.close();
}

module.exports = app;
module.exports.stop = stop;
