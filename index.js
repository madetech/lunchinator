const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello World!"));

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

function stop() {
  server.close();
}

module.exports = app;
module.exports.stop = stop;
