const express = require("express");
const {
  getDashboard,
} = require("./dashboardsController");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("@middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);


router.get("/", roleMiddleware(["admin"]), getDashboard);


module.exports = router;
