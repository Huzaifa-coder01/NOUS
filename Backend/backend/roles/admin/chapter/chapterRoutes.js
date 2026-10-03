const express = require("express");
const {
  createChapter,
  getChapter,
  updateChapter,
  deleteChapter,
  getChapterDetails,
} = require("./chapterController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const ChapterRateLimiter = createRateLimiter("Chapter");

router.post("/", roleMiddleware(["admin"]), ChapterRateLimiter, createChapter);

router.get(
  "/",
  roleMiddleware(["admin", "student"]),
  ChapterRateLimiter,
  getChapter,
);

router.get(
  "/:id",
  roleMiddleware(["admin", "student"]),
  ChapterRateLimiter,
  getChapterDetails,
);

router.put("/:id", roleMiddleware(["admin"]), updateChapter);

router.delete("/:id", roleMiddleware(["admin"]), deleteChapter);

module.exports = router;
