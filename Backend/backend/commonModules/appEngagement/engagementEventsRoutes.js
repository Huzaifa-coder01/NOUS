const express = require("express");
const auth = require("../../middlewares/authMiddleware");
const {
  logEngagement,
  getTrending,
  getLeads,
} = require("./engagementEventsController");

const router = express.Router();

router.use(auth);

router.post("/log", logEngagement);
router.get("/trending", getTrending);
router.get("/leads", getLeads);

module.exports = router;
