const express = require("express");
const router = express.Router();
const { LunchCycleService, AuthService } = require("@services");

router.post("/login", async function(req, res) {
  const authService = new AuthService();
  const token = authService.getToken(req);
  if (!token) {
    return res.status(401).send("soz");
  }
  return res.json({ token: token });
});

router.get("/currentavailabilities", async function(req, res) {
  const authService = new AuthService();
  const token = authService.getToken(req);
  if (!token) {
    return res.status(401).send("soz");
  }

  const lunchCycleService = new LunchCycleService();
  const lunchCycle = await lunchCycleService.getCurrentLunchCycle();
  const availabilities = await lunchCycleService.updateLunchers();

  res.json({
    lunchCycle: lunchCycle,
    availabilities: availabilities
  });
});

router.get("/currentdraw", async function(req, res) {
  const authService = new AuthService();
  const token = authService.getToken(req);
  if (!token) {
    return res.status(401).send("soz");
  }

  const lunchCycleService = new LunchCycleService();
  const lunchCycleDraw = await lunchCycleService.getLatestLunchCycleDraw();
  res.json(lunchCycleDraw);
});

router.get("/alllunchers", async function(req, res) {
  const authService = new AuthService();
  const token = authService.getToken(req);
  if (!token) {
    return res.status(401).send("soz");
  }

  const lunchCycleService = new LunchCycleService();
  const allLunchers = await lunchCycleService.fetchSlackUsers();
  res.json(allLunchers);
});

router.post("/update", async function(req, res) {
  const authService = new AuthService();
  const token = authService.getToken(req);
  if (!token) {
    return res.status(401).send("soz");
  }

  const lunchCycleService = new LunchCycleService();
  await lunchCycleService.updateDraw(req.body);
  return res.sendStatus(200);
});

module.exports = router;
