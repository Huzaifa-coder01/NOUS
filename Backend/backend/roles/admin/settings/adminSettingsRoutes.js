const express = require("express");
const {
  getTermsAndConditions,
  getAboutUs,
  getPrivacyPolicy,
  updateAdminSettings,
  createAdminSettings,
  getCustomerTermsAndConditions,
  getReviewTermsAndConditions,
  getFaqs
} = require("./controllers/adminSettingsController");
const auth = require("../../../middlewares/authMiddleware");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

const apiRateLimiter = createRateLimiter("AdminSettings");

router.get("/terms-conditions", apiRateLimiter, getTermsAndConditions);
router.get("/review-terms-conditions", apiRateLimiter, getReviewTermsAndConditions);
router.get("/customer-terms-conditions", apiRateLimiter, getCustomerTermsAndConditions);

router.get("/about-us", apiRateLimiter, getAboutUs);

router.get("/privacy-policy", apiRateLimiter, getPrivacyPolicy);

router.get("/faqs",auth, apiRateLimiter, getFaqs);

router.post("/create", auth, roleMiddleware(["admin"]), createAdminSettings);

router.put("/update/:id", auth, roleMiddleware(["admin"]), updateAdminSettings);

module.exports = router;
