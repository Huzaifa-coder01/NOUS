const express = require("express");
const {
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjectDetails,
} = require("./subjectController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const SubjectRateLimiter = createRateLimiter("Subject");

router.post("/", roleMiddleware(["admin"]), SubjectRateLimiter, createSubject);

router.get(
  "/",
  roleMiddleware(["admin", "student"]),
  SubjectRateLimiter,
  getSubject,
);

router.get(
  "/:id",
  roleMiddleware(["admin", "student"]),
  SubjectRateLimiter,
  getSubjectDetails,
);

router.put("/:id", roleMiddleware(["admin"]), updateSubject);

router.delete("/:id", roleMiddleware(["admin"]), deleteSubject);

module.exports = router;
