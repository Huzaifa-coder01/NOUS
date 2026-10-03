const express = require("express");
const moment = require("moment");
const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getJobDetails,
} = require("./jobController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const JobRateLimiter = createRateLimiter("Jobs");

router.post("/", roleMiddleware(["admin","careHome"]), JobRateLimiter, createJob);

router.get("/", roleMiddleware(["admin","careHome","agency"]), JobRateLimiter, getJobs);
router.get("/:id", roleMiddleware(["admin", "careHome"]), JobRateLimiter, getJobDetails);


router.put("/:id", roleMiddleware(["admin","careHome"]), updateJob);

router.delete("/:id", roleMiddleware(["admin","careHome"]), deleteJob);

module.exports = router;
