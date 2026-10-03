const express = require("express");
const {
  createReviewTemplate,
  getReviewTemplates,
  updateReviewTemplate,
  deleteReviewTemplate,
} = require("./reviewTemplateController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const ReviewTemplateRateLimiter = createRateLimiter("ReviewTemplates");

router.post("/", roleMiddleware(["admin"]), ReviewTemplateRateLimiter, createReviewTemplate);

router.get("/", roleMiddleware(["admin","user","coach"]), ReviewTemplateRateLimiter, getReviewTemplates);


router.put("/:id", roleMiddleware(["admin"]), updateReviewTemplate);

router.delete("/:id", roleMiddleware(["admin"]), deleteReviewTemplate);

module.exports = router;
