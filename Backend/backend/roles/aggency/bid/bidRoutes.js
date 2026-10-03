const express = require("express");
const moment = require("moment");
const {
  createBid,
  getBid,
  updateBid,
  deleteBid,
  getBidDetails,
} = require("./bidController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const BidRateLimiter = createRateLimiter("Bid");

router.post("/", roleMiddleware(["admin","agency"]), BidRateLimiter, createBid);

router.get("/", roleMiddleware(["admin","agency"]), BidRateLimiter, getBid);
router.get("/:id", roleMiddleware(["admin","agency"]), BidRateLimiter, getBidDetails);


router.put("/:id", roleMiddleware(["admin","agency"]), updateBid);

router.delete("/:id", roleMiddleware(["admin","agency"]), deleteBid);

module.exports = router;
