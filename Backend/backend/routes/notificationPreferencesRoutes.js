const express = require("express");
const {
  getNotificationPreferences,
  upsertNotificationPreferences,
} = require("../controllers/notificationPreferencesController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(auth);

router.get("/", getNotificationPreferences);
router.put("/", upsertNotificationPreferences);

module.exports = router;
