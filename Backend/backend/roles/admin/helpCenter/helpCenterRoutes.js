const express = require("express");
const {
  createHelpCenter,
  getHelpCenters,
  updateHelpCenter,
  deleteHelpCenter,
  getHelpCenterDetails
} = require("./helpCenterController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);


const HelpCenterRateLimiter = createRateLimiter("HelpCenters");


router.post("/", roleMiddleware(["admin"]), HelpCenterRateLimiter, createHelpCenter);


router.get("/", roleMiddleware(["admin", "user","coach"]), HelpCenterRateLimiter, getHelpCenters);


router.put("/:id", roleMiddleware(["admin"]), updateHelpCenter);
router.get("/:id", roleMiddleware(["admin", "user","coach"]), getHelpCenterDetails);

router.delete("/:id", roleMiddleware(["admin"]), deleteHelpCenter);

module.exports = router;
