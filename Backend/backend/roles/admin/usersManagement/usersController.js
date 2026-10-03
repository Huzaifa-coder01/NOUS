const {
  sendResponse,
  parsePaginationParams,
  validateParams,
  generateMeta,
  getReadableErrorMessage,
} = require("../../../helperUtils/responseUtil.js");
const { User } = require("@UsersModel");

const { formatUserResponse } = require("../../../helperUtils/userResponseUtil.js");
const usersService = require("./usersService.js");
const { registerUserUtility } = require("../../../controllers/authUtil.js");

const createUser = async (req, res) => {
  const result = await registerUserUtility(req, res, {
    autoVerify: true,
  });

  if (result.responseSent) return;

  if (!result.success) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: result.error.translationKey,
      error: result.error,
    });
  }

  return sendResponse({
    res,
    statusCode: 201,
    translationKey: "signup_successful",
    data: result.user,
  });
};


const getAllUsers = async (req, res) => {
  const { page, limit } = parsePaginationParams(req);
  const { keyword, status, userType } = req.query;
  const currentUser = req.user;

  if (currentUser.userType === "admin") {
    try {
      const { users, meta } = await usersService.getAllUsers({
        page,
        limit,
        keyword,
        status,
        userType,
      });

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "users_fetched_successfully",
        data: users,
        meta,
      });
    } catch (error) {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "internal_server",
        error,
      });
    }
  } else if (["manager", "organizer"].includes(currentUser.userType)) {
    try {
      if (
        !validateParams(req, res, {
          enumFields: { userType: ["staff", "manager"] },
        })
      )
        return;

      const { users, meta } = await usersService.getStaff({
        page,
        limit,
        keyword,
        status,
        userType,
        currentUser,
      });

      const filteredUsers = users.filter((user) => {
        if (currentUser.userType === "organizer") {
          return user.organizations?.some(
            (org) => org.creator.toString() === currentUser._id.toString(),
          );
        }

        if (currentUser.userType === "manager") {
          return user.organizations?.some((org) =>
            org.staff.some(
              (s) => s.user.toString() === currentUser._id.toString(),
            ),
          );
        }

        return false;
      });

      const sanitizedUsers = filteredUsers.map((user) => {
        return formatUserResponse(User.prototype.toJSON(user));
      });

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "users_fetched_successfully",
        data: sanitizedUsers,
        meta,
      });
    } catch (error) {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "internal_server",
        error,
      });
    }
  }
};
const getUsers = async (req, res) => {
  const { page, limit } = parsePaginationParams(req);
  const { keyword, status, userType } = req.query;
  const currentUser = req.user

  if (currentUser.userType === "admin") {
    try {
      const { users, meta } = await usersService.getAllUsers({
        page,
        limit,
        keyword,
        status,
        userType
      });
      const sanitizedUsers = users.map(user => {
        return formatUserResponse(User.prototype.toJSON(user));
      });

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "users_fetched_successfully",
        data: sanitizedUsers,
        meta
      });
    } catch (error) {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "internal_server",
        error,
      });
    }
  } else if (["manager", "organizer"].includes(currentUser.userType)) {
    try {

      if (
        !validateParams(req, res, {
          enumFields: { userType: ["staff", "manager"] },
        })
      )
        return;

      const { users, meta } = await usersService.getStaff({
        page,
        limit,
        keyword,
        status,
        userType,
        currentUser
      });

      const filteredUsers = users.filter(user => {
        if (currentUser.userType === "organizer") {
          return user.organizations?.some(
            org => org.creator.toString() === currentUser._id.toString()
          );
        }

        if (currentUser.userType === "manager") {
          return user.organizations?.some(
            org => org.staff.some(
              s => s.user.toString() === currentUser._id.toString()
            )
          );
        }

        return false;
      });

      const sanitizedUsers = filteredUsers.map(user => {
        return formatUserResponse(User.prototype.toJSON(user));
      });

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "users_fetched_successfully",
        data: sanitizedUsers,
        meta
      });
    } catch (error) {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "internal_server",
        error,
      });
    }
  }

};


const updateUser = async (req, res) => {
  const { id } = req.params;

  if (
    !validateParams(req, res, {
      pathParams: ["id"],
      objectIdFields: ["id"],
    })
  )
    return;

  try {
    const currentUser = req.user;


    if (
      currentUser._id.toString() !== id &&
      !["admin"].includes(currentUser.userType)
    ) {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "unauthorized_to_perform_this_action",
      });
    }
    const result = await usersService.updateUser(req, res, { userId: id });

    if (result && result.errorCode) {
      return sendResponse({
        res,
        statusCode: result.errorCode,
        translationKey: result.message,
        values: result.field ? { field: result.field } : undefined
      });
    }

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "user_profile_updated_successfully",
      data: result
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "user_profile_update_error",
      values: { errorMessage: error.message },
      error
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (
    !validateParams(req, res, {
      pathParams: ["id"],
      objectIdFields: ["id"],
    })
  )
    return;

  try {
    const deleted = await usersService.deleteUser(id);
    if (!deleted) {
      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "user_not_found",
      });
    }

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "user_deleted_successfully",
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server",
      error,
    });
  }
};

const getUserDetails = async (req, res) => {
  const { id } = req.params;

  if (
    !validateParams(req, res, {
      pathParams: ["id"],
      objectIdFields: ["id"],
    })
  )
    return;

  try {
    let user = await usersService.getUserDetails(id);

    if (!user) {
      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "user_details_not_found",
      });
    }

    let userObject = new User(user).toJSON();

    const response = formatUserResponse(userObject);
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "user_fetched_successfully",
      data: response,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server",
      error,
    });
  }
};



const setupTwoFAController = async (req, res) => {
  const user = req.user;
  try {
    const result = await usersService.setupTwoFA(user._id);
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "2fa_setup",
      data: { qrCode: result.qrCodeDataURL },
    });
  } catch (error) {
    return sendResponse({ res, statusCode: 500, translationKey: "internal_server", error: error });
  }
};

const confirmTwoFAController = async (req, res) => {
  const user = req.user;
  const { token } = req.body;

  try {
    const { isValid, newlyEnabled } = await usersService.confirmTwoFA(user._id, token);

    if (!isValid) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "invalid_2fa_token",
      });
    }

    if (newlyEnabled) {
      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "2fa_enabled_successfully",
      });
    }

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "2fa_verified_successfully",
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server",
      error,
    });
  }
};


const disableTwoFAController = async (req, res) => {
  const user = req.user;
  try {
    await usersService.disableTwoFA(user._id);
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "2fa_disabled_successfully",
    });
  } catch (error) {
    return sendResponse({ res, statusCode: 500, translationKey: "internal_server", error });
  }
};


const getAllAthletes = async (req, res) => {
  const { page, limit } = parsePaginationParams(req);
  const { keyword, status, userType } = req.query;
  const currentUser = req.user;

  if (currentUser.userType === "admin") {
    try {
      const { users, meta } = await usersService.getAllAthletes({
        page,
        limit,
        keyword,
        status,
        userType,
      });

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "users_fetched_successfully",
        data: users,
        meta,
      });
    } catch (error) {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "internal_server",
        error,
      });
    }
  } else if (["manager", "organizer"].includes(currentUser.userType)) {
    try {
      if (
        !validateParams(req, res, {
          enumFields: { userType: ["staff", "manager"] },
        })
      )
        return;

      const { users, meta } = await usersService.getStaff({
        page,
        limit,
        keyword,
        status,
        userType,
        currentUser,
      });

      const filteredUsers = users.filter((user) => {
        if (currentUser.userType === "organizer") {
          return user.organizations?.some(
            (org) => org.creator.toString() === currentUser._id.toString(),
          );
        }

        if (currentUser.userType === "manager") {
          return user.organizations?.some((org) =>
            org.staff.some(
              (s) => s.user.toString() === currentUser._id.toString(),
            ),
          );
        }

        return false;
      });

      const sanitizedUsers = filteredUsers.map((user) => {
        return formatUserResponse(User.prototype.toJSON(user));
      });

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "users_fetched_successfully",
        data: sanitizedUsers,
        meta,
      });
    } catch (error) {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "internal_server",
        error,
      });
    }
  }
};


module.exports = {
  createUser,
  getUsers,
  updateUser,
  setupTwoFAController,
  confirmTwoFAController,
  disableTwoFAController,
  deleteUser,
  getUserDetails,
  getAllUsers,
  getAllAthletes,
};
