const express = require("express");
const {
  createSubAdmins,
  getSubAdmins,
  updateSubAdmins,
  deleteSubAdmins,
  getPermissions,
} = require("./subAdminsController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const SubAdminsRateLimiter = createRateLimiter("SubAdmins");

router.post("/", roleMiddleware(["admin"]), SubAdminsRateLimiter, createSubAdmins);

router.get("/", roleMiddleware(["admin"]), SubAdminsRateLimiter, getSubAdmins);
router.get("/permissions", roleMiddleware(["admin"]), SubAdminsRateLimiter, getPermissions);


router.put("/:id", roleMiddleware(["admin"]), updateSubAdmins);

router.delete("/:id", roleMiddleware(["admin"]), deleteSubAdmins);

module.exports = router;
