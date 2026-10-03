const express = require("express");
const {
  createFaqs,
  getFaqss,
  updateFaqs,
  deleteFaqs,
} = require("./faqsController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const FaqsRateLimiter = createRateLimiter("Faqss");

router.post("/", roleMiddleware(["admin"]), FaqsRateLimiter, createFaqs);

router.get("/", roleMiddleware(["admin"]), FaqsRateLimiter, getFaqss);


router.put("/:id", roleMiddleware(["admin"]), updateFaqs);

router.delete("/:id", roleMiddleware(["admin"]), deleteFaqs);

module.exports = router;
