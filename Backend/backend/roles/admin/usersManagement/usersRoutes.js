const express = require("express");
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserDetails,
  setupTwoFAController,
  confirmTwoFAController,
  disableTwoFAController,
  getAllUsers,
  getAllAthletes,
} = require("./usersController");
const createRateLimiter = require("../../../helperUtils/rateLimiter");
const auth = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");

const router = express.Router();

router.use(auth);

const apiRateLimiterUsers = createRateLimiter("/users");
const apiRateLimiterUserDetail = createRateLimiter("/users/details");
const apiRateLimiterUserCreation = createRateLimiter("/users/create");
const apiRateLimiterUserUpdate = createRateLimiter("/users/update");
const apiRateLimiterUserDeletion = createRateLimiter("/users/delete");
const apiRateLimiterUserTwoFA = createRateLimiter("/users/twofa/setup", 3, 10);
const apiRateLimiterTwoFAConfirm = createRateLimiter("/users/twofa/confirm", 5, 10);
const apiRateLimiterTwoFADisable = createRateLimiter("/users/twofa/disable", 2, 30);

router.get(
  "/coach",
  apiRateLimiterUsers,
  roleMiddleware(["admin", "organizer", "manager"]),
  getAllUsers,
);
router.get(
  "/athlete",
  apiRateLimiterUsers,
  roleMiddleware(["admin", "organizer", "manager"]),
  getAllAthletes,
);
router.post("/", roleMiddleware(["admin", "organizer", "manager"]), apiRateLimiterUserCreation, createUser);


router.get("/:id", apiRateLimiterUserDetail, getUserDetails);

router.get("/", apiRateLimiterUsers, roleMiddleware(["admin", "organizer", "manager"]), getUsers);


router.put("/:id", apiRateLimiterUserUpdate, updateUser);


router.post("/twofa/setup", apiRateLimiterUserTwoFA, setupTwoFAController);

router.post("/twofa/confirm", apiRateLimiterTwoFAConfirm, confirmTwoFAController);

router.post("/twofa/disable", apiRateLimiterTwoFADisable, disableTwoFAController);


router.delete("/:id", apiRateLimiterUserDeletion, deleteUser);

module.exports = router;
