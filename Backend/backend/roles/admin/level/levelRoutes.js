const express = require("express");
const {
  createLevel,
  getLevel,
  updateLevel,
  deleteLevel,
  getLevelDetails,
} = require("./levelController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const LevelRateLimiter = createRateLimiter("Level");

router.post("/", roleMiddleware(["admin"]), LevelRateLimiter, createLevel);

router.get(
  "/",
  roleMiddleware(["admin", "student"]),
  LevelRateLimiter,
  getLevel,
);

router.get(
  "/:id",
  roleMiddleware(["admin", "student"]),
  LevelRateLimiter,
  getLevelDetails,
);

router.put("/:id", roleMiddleware(["admin"]), updateLevel);

router.delete("/:id", roleMiddleware(["admin"]), deleteLevel);

module.exports = router;
