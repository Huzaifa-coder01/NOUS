const express = require("express");
const {
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseDetails,
} = require("./courseController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const CourseRateLimiter = createRateLimiter("Course");

router.post("/", roleMiddleware(["admin"]), CourseRateLimiter, createCourse);

router.get(
  "/",
  roleMiddleware(["admin", "student"]),
  CourseRateLimiter,
  getCourse,
);

router.get(
  "/:id",
  roleMiddleware(["admin", "student"]),
  CourseRateLimiter,
  getCourseDetails,
);

router.put("/:id", roleMiddleware(["admin"]), updateCourse);

router.delete("/:id", roleMiddleware(["admin"]), deleteCourse);

module.exports = router;
