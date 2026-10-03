  const express = require("express");
const router = express.Router();

router.use("/", require("./index"));
router.use("/conversations", require("../commonModules/chatModule/routes/messageRoutes"));
router.use("/coach", require("../roles/coach/routes/index"));
router.use("/athlete", require("../roles/user/routes/index"));

router.use("/google-calendar", require("../commonModules/googleCalendar/routes/googleCalendar.routes"))

module.exports = router;