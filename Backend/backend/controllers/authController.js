const { User, generateResetToken, USER_TYPES } = require("../models/UserModel");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const bcrypt = require("bcryptjs");
const {
  sendResponse,
  validateParams,
  getReadableErrorMessage,
} = require("../helperUtils/responseUtil");
const { formatUserResponse } = require("../helperUtils/userResponseUtil");
const { sendEmailViaBrevo } = require("../helperUtils/emailUtil");
const {
  forgotPasswordViaLinkEmailTemplate,
  registrationViaLinkEmailTemplate,
  forgotPasswordViaOtpEmailTemplate,
  OTP_PURPOSE_CONFIG,
  otpEmailTemplate,
} = require("../helperUtils/emailTemplates");
const { createOrSkipDevice, Devices } = require("../models/Devices");
const validator = require("validator");
const crypto = require("crypto");
const { registerUserUtility } = require("./authUtil");
const { validatePhoneNumber } = require("../helperUtils/validationsUtil");
const UsersOnboardingResponsesModel = require("../roles/admin/onboardingAndFilters/usersOnboardingResponses/UsersOnboardingResponsesModel");
const CoachOnboardingResponses = require("../roles/admin/onboardingAndFilters/coachOnboardingResponses/CoachOnboardingResponsesModel");
const { SubAdmin } = require("../roles/admin/subAdmins/SubAdmins");

const createAdmin = async (req, res) => {
  try {
    const allowedIPs = ["223.123.44.6", "127.0.0.1", "::1", "192.168.15.40"];

    const ip = (
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      ""
    )
      .split(",")[0]
      .trim()
      .replace("::ffff:", "");

    if (!allowedIPs.includes(ip)) {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "forbidden",
      });
    }

    const key = req.headers["x-admin-access-token-signup"];
    if (key !== process.env.ADMIN_ACCESS_TOKEN_SIGNUP) {
      return sendResponse({
        res,
        statusCode: 401,
        translationKey: "unauthorized_admin_signup",
      });
    }

    const validationOptions = {
      rawData: [
        "email",
        "name",
        "password",
        "timezone",
        "deviceType",
        "deviceId",
      ],
      minLengthFields: {
        password: 6, // Password must be at least 6 characters long
      },
    };
    if (!validateParams(req, res, validationOptions)) {
      return;
    }

    const {
      email,
      name,
      profileIcon,
      password,
      timezone,
      deviceId,
      deviceType,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "admin_already_exists",
      });
    }

    const user = new User({
      email,
      profileIcon,
      name,
      password,
      timezone,
      accountState: { userType: "admin", status: "active" },
      verificationStatus: { email: "verified", phoneNumber: "verified" },
    });

    await user.save();

    if (
      typeof deviceId === "string" &&
      deviceId.trim() &&
      deviceId !== "test" &&
      typeof deviceType === "string"
    ) {
      createOrSkipDevice(user._id, deviceId.trim(), deviceType);
    }

    return sendResponse({
      res,
      statusCode: 201,
      translationKey: "admin_created_successfully",
    });
  } catch (err) {
    console.error("Error in createAdmin:", err);
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server_error",
    });
  }
};

const register = async (req, res) => {
  // Public signup only needs these fields, admin is created internally only
  const validationOptions = {
    rawData: ["name", "profileIcon", "email", "password", "deviceId", "deviceType", "userType"],
    enumFields: {
      userType: USER_TYPES.filter((type) => type !== "admin"),
    },
    minLengthFields: {
      password: 6, // Password must be at least 6 characters long
    },
  };
  if (!validateParams(req, res, validationOptions)) {
    return;
  }

  const result = await registerUserUtility(req, res, {
    autoVerify: false,
    allowAdminCreation: false,
  });

  if (result.responseSent) return;

  if (!result.success) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: result.error.translationKey,
      message: result.error.message,
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

const companyDetails = async (req, res) => {
  const {
    logo,
    coverImage,
    description,
    category,
    name,
    oib,
    bankAccountNumber,
    representativeName,
    location,
    suppliers,
  } = req.body;

  try {
    const user = await User.findById(req.user._id).select("companyDetails");

    if (!user.companyDetails) {
      const validationOptions = {
        rawData: [
          "name",
          "oib",
          "bankAccountNumber",
          "representativeName",
          "location",
        ],
      };
      if (!validateParams(req, res, validationOptions)) {
        return;
      }
    }

    user.companyDetails = {
      logo: logo !== undefined ? logo : user.companyDetails?.logo,
      coverImage:
        coverImage !== undefined ? coverImage : user.companyDetails?.coverImage,
      description:
        description !== undefined
          ? description
          : user.companyDetails?.description,
      category:
        category !== undefined ? category : user.companyDetails?.category,
      name: name !== undefined ? name : user.companyDetails?.name,
      oib: oib !== undefined ? oib : user.companyDetails?.oib,
      bankAccountNumber:
        bankAccountNumber !== undefined
          ? bankAccountNumber
          : user.companyDetails?.bankAccountNumber,
      representativeName:
        representativeName !== undefined
          ? representativeName
          : user.companyDetails?.representativeName,
      location:
        location !== undefined ? location : user.companyDetails?.location,
      suppliers:
        suppliers !== undefined ? suppliers : user.companyDetails?.suppliers,
    };

    await user.save();

    return sendResponse({
      res,
      statusCode: 201,
      translationKey: "company_details_saved",
      data: user.companyDetails,
    });
  } catch (error) {
    const readableError = getReadableErrorMessage(error);
    return sendResponse({
      res,
      statusCode: readableError.statusCode,
      translationKey: readableError.message,
      error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, deviceId, deviceType } = req.body;
    const validationOptions = {
      rawData: ["email", "password", "deviceId", "deviceType"],
    };
    if (!validateParams(req, res, validationOptions)) {
      return;
    }
    let populateFields = [];

    const user = await User.findByCredentials(
      email,
      password,
      undefined,
      undefined,
      populateFields,
    );





    if (user.error) {
      if (user.error === "user_not_found") {
        return sendResponse({
          res,
          statusCode: 404,
          translationKey: "user_not_found",
        });
      } else if (user.error === "incorrect_password") {
        return sendResponse({
          res,
          statusCode: 400,
          translationKey: "incorrect_password",
        });
      }
    }

    const orignalUserType = user.accountState.userType;
    const orignalSubAdminId = user._id;
    let permissions = [];
    if (user.accountState.userType === "subAdmin") {
      const subAdmin = await SubAdmin.findOne({ user: user._id });
      if (!subAdmin) {
        return sendResponse({
          res,
          statusCode: 404,
          translationKey: "user_not_found",
        });
      }
      user.orignalUserType = user.accountState.userType;
      user.accountState.userType = "admin";
      user._id = subAdmin.creator;
      permissions = subAdmin.permissions;
      
    }
    if (user.accountState.userType === "admin") {
      const adminCreationToken = req.header("x-admin-access-token");
      if (adminCreationToken === process.env.ADMIN_ACCESS_TOKEN) {
      } else {
        return sendResponse({
          res,
          statusCode: 403,
          translationKey: "unauthorized_to_1",
        });
      }
    }

    // The email has to be verified through the OTP APIs before logging in
    const verificationStatus = user.verificationStatus["email"];
    if (verificationStatus === "pending") {
      return sendResponse({
        res,
        statusCode: 401,
        translationKey: "email_not_verified",
        data: {
          email: user.email,
          isEmailVerified: false,
        },
      });
    }

    if (user.accountState.status === "pending") {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "pending_approval",
      });
    }

    if (user.accountState.status === "rejected") {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "rejected_verification",
        data: {
          reason: user.accountState.reason || "No reason provided",
        },
      });
    }

    if (
      user.accountState.status === "suspended" ||
      user.accountState.status === "deleted" ||
      user.accountState.status === "inactive"
    ) {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "your_account_2",
      });
    }

    const userObject = user.toJSON();
    if (orignalUserType === "subAdmin") {
      userObject.orignalUserType = orignalUserType;
      userObject.orignalSubAdminId = orignalSubAdminId;
      userObject.permissions = permissions;
      user.orignalSubAdminId= orignalSubAdminId;
    }
    const token = user.generateAuthToken();
 

    let response = formatUserResponse(userObject, token, [], ["resetToken"]);

    if (
      typeof deviceId === "string" &&
      deviceId.trim() &&
      deviceId !== "test" &&
      typeof deviceType === "string"
    ) {
      createOrSkipDevice(userObject._id, deviceId, deviceType);
    } else {
      console.warn("FCM Token information not saved due to invalid input");
    }

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "login_success",
      data: response,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: error,
      error,
    });
  }
};
const loginTest = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    const validationOptions = {
      rawData: ["email", "password", "userType"],
      enumFields: {
        userType: User.USER_TYPES,
      },
    };
    if (!validateParams(req, res, validationOptions)) {
      return;
    }
    let populateFields = [];

    const user = await User.findOne({
      email,
      "accountState.userType": userType,
    });

    if (!user) {
      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "user_not_found",
      });
    }

    if (user.accountState.userType === "admin") {
      const adminCreationToken = req.header("x-admin-access-token");
      if (adminCreationToken === process.env.ADMIN_ACCESS_TOKEN) {
      } else {
        return sendResponse({
          res,
          statusCode: 403,
          translationKey: "unauthorized_to_1",
        });
      }
    }

    const verificationStatus = user.verificationStatus["email"];
    if (verificationStatus === "pending") {
      return sendResponse({
        res,
        statusCode: 401,
        translationKey: "your_account",
      });
    }

    if (user.accountState.status === "pending") {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "pending_approval",
      });
    }

    if (user.accountState.status === "rejected") {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "rejected_verification",
        data: {
          reason: user.accountState.reason || "No reason provided",
        },
      });
    }

    if (user.accountState.status === "suspended") {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "your_account_2",
      });
    }

    const token = user.generateAuthToken();

    const userObject = user.toJSON();

    const response = formatUserResponse(
      userObject,
      token,
      [],
      ["resetToken", "organizations"],
    );

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "login_success",
      data: response,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: error,
      error,
    });
  }
};

const generateOtp = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, phoneNumber, type, purpose = "generic" } = req.body;

    const validationOptions = {
      rawData: [type === "email" ? "email" : "phoneNumber"],
    };

    if (!validateParams(req, res, validationOptions)) return;

    if (
      type === "phoneNumber" &&
      phoneNumber &&
      (typeof phoneNumber !== "object" ||
        !phoneNumber.code ||
        !phoneNumber.number ||
        !validatePhoneNumber(`${phoneNumber.code}${phoneNumber.number}`).valid)
    ) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "invalid_phone",
      });
    }

    let user;
    if (type === "email") {
      user = await User.findOne({ email: email.toLowerCase() }).select(
        "email accountState otpInfo timezone",
      );
    } else {
      user = await User.findOne({
        "phoneNumber.code": phoneNumber.code,
        "phoneNumber.number": phoneNumber.number,
      }).select("phoneNumber accountState otpInfo timezone");
    }

    if (!user) {
      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "user_not",
      });
    }

    if (["restricted", "suspended"].includes(user.accountState.status)) {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "your_account_4",
      });
    }

    const otp = user.generateOtp(type, user.timezone, purpose);

    if (otp?.error === "too_many_otp_requests") {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "too_many_otp_requests",
      });
    }

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    const config = OTP_PURPOSE_CONFIG[purpose] || OTP_PURPOSE_CONFIG.generic;

    if (type === "email") {
      const subject = config.subject;

      const mBody = otpEmailTemplate({
        otp,
        title: config.title,
        message: config.message,
      });

      await sendEmailViaBrevo([email], subject, mBody);
    }
    if (
      (process.env.NODE_ENV === "dev" ||
        process.env.NODE_ENV === "mobileapps" ||
        process.env.NODE_ENV === "localhost") &&
      otp
    ) {
      return sendResponse({
        res,
        statusCode: 201,
        translationKey: "otp_generated",
        data: {
          otp,
        },
      });
    } else {
      return sendResponse({
        res,
        statusCode: 201,
        translationKey: "otp_generated",
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return sendResponse({
      res,
      statusCode: 500,
      translationKey: error.message,
      error,
    });
  }
};

const verifyOtp = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { email, phoneNumber, type, otp } = req.body;

    const validationOptions = {
      rawData: [type === "email" ? "email" : "phoneNumber"],
    };

    if (type === "email") {
      validationOptions.rawData.push("otp");
    }

    if (!validateParams(req, res, validationOptions)) {
      await session.abortTransaction();
      return;
    }

    if (
      type === "phoneNumber" &&
      phoneNumber &&
      (typeof phoneNumber !== "object" ||
        !phoneNumber.code ||
        !phoneNumber.number ||
        !validatePhoneNumber(`${phoneNumber.code}${phoneNumber.number}`).valid)
    ) {
      await session.abortTransaction();

      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "invalid_phone",
      });
    }

    let user;

    if (type === "email") {
      user = await User.findOne({ email: email.toLowerCase() })
        .select(
          "email accountState otpInfo verificationStatus timezone resetToken",
        )
        .session(session);
    }

    if (type === "phoneNumber") {
      user = await User.findOne({
        "phoneNumber.code": phoneNumber.code,
        "phoneNumber.number": phoneNumber.number,
      })
        .select(
          "phoneNumber accountState otpInfo verificationStatus timezone resetToken",
        )
        .session(session);
    }

    if (!user) {
      await session.abortTransaction();

      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "user_not",
      });
    }

    const userOtpInfo =
      type === "email" ? user.otpInfo.emailOtp : user.otpInfo.phoneNumberOtp;

    if (type === "email") {
      if (userOtpInfo.otp !== otp.toString()) {
        await session.abortTransaction();

        return sendResponse({
          res,
          statusCode: 400,
          translationKey: "invalid_otp",
        });
      }

      const currentTime = moment.tz(Date.now(), user.timezone).valueOf();

      if (userOtpInfo.otpExpires && userOtpInfo.otpExpires < currentTime) {
        await session.abortTransaction();

        return sendResponse({
          res,
          statusCode: 400,
          translationKey: "otp_has",
        });
      }
    }

    userOtpInfo.otp = "";
    userOtpInfo.otpExpires = "";
    userOtpInfo.otpUsed = true;

    user.verificationStatus[type] = "verified";

    // A freshly registered account stays pending until its email is verified
    if (type === "email" && user.accountState.status === "pending") {
      user.accountState.status = "active";
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;

    await user.save({ session });

    await session.commitTransaction();

    const updatedUser = await User.findById(user._id).lean();

    const token = user.generateAuthToken();

    let response = formatUserResponse(updatedUser, token);

    let onboardesAsCoach = false;
    let onboardedAsAthlete = false;
    onboardedAsAthlete = await UsersOnboardingResponsesModel.findOne({
      user: user._id,
    });
    onboardesAsCoach = await CoachOnboardingResponses.findOne({
      coach: user._id,
    });
    response.onboardedAsCoach = onboardesAsCoach ? true : false;
    response.onboardedAsAthlete = onboardedAsAthlete ? true : false;

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "otp_verified",
      data: response,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Error during OTP verification:", error);

    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "an_error",
      error,
    });
  } finally {
    session.endSession();
  }
};

const verifyEmailViaLink = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: "missing_token",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    "emailVerification.tokenHash": tokenHash,
  });

  if (!user) {
    return sendResponse({
      res,
      statusCode: 404,
      translationKey: "invalid_or_expired_verification_link",
    });
  }

  const { expiresAt, used } = user.emailVerification;

  if (used) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: "verification_link_already_used",
    });
  }

  if (Date.now() > expiresAt) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: "verification_link_expired",
    });
  }

  user.verificationStatus.email = "verified";
  user.emailVerification.used = true;
  user.emailVerification.otpRequestCount = 0;
  await user.save();

  return res.redirect(
    `${process.env.EMAIL_VERIFICATION_REDIRECT_URL}?verification=success`,
  );
};

const resendEmailVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "user_not_found",
      });
    }

    const tokenData = user.generateEmailVerificationToken();
    if (tokenData.error) {
      if (tokenData.error === "too_many_verification_requests") {
        return sendResponse({
          res,
          statusCode: 400,
          translationKey: "too_many_verification_requests",
        });
      }
    }

    await user.save();

    const mBody = registrationViaLinkEmailTemplate(tokenData.verificationLink);
    await sendEmailViaBrevo([user.email], "Email Verification", mBody);

    return sendResponse({
      res,
      statusCode: 201,
      translationKey: "verification_email_sent",
      data: { verificationLink: tokenData.verificationLink },
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server_error",
      error: error,
    });
  }
};

const sendPasswordResetLink = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return sendResponse({
      res,
      statusCode: 404,
      translationKey: "user_not_found",
    });
  }

  const tokenData = user.generatePasswordResetToken();

  if (tokenData.error) {
    if (tokenData.error === "too_many_password_reset_requests") {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "too_many_password_reset_requests",
      });
    }
  }

  await user.save();

  const mBody = forgotPasswordViaLinkEmailTemplate(tokenData.resetLink);
  await sendEmailViaBrevo([user.email], "Password Reset", mBody);

  return sendResponse({
    res,
    statusCode: 200,
    translationKey: "password_reset_link_sent",
    data: { resetLink: tokenData.resetLink },
  });
};

const verifyPasswordResetLink = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: "missing_token",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({ "passwordReset.tokenHash": tokenHash });
  if (
    !user ||
    user.passwordReset.used ||
    Date.now() > user.passwordReset.expiresAt
  ) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: "invalid_or_expired_link",
    });
  }

  return res.redirect(`${process.env.PASSWORD_RESET_FRONTEND_URL}${token}`);
};

const resetPasswordViaLink = async (req, res) => {
  const { token, newPassword } = req.body;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({ "passwordReset.tokenHash": tokenHash });
  if (
    !user ||
    user.passwordReset.used ||
    Date.now() > user.passwordReset.expiresAt
  ) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: "invalid_or_expired_link",
    });
  }

  user.password = newPassword;
  user.passwordReset.used = true;
  user.passwordReset.otpRequestCount = 0;
  await user.save();

  return sendResponse({
    res,
    statusCode: 200,
    translationKey: "password_reset_successful",
  });
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    const validationOptions = {
      rawData: ["email", "newPassword", "resetToken"],
    };
    if (!validateParams(req, res, validationOptions)) {
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetToken: resetToken,
    });

    if (!user) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "no_valid",
      });
    }

    user.password = newPassword;
    user.otpInfo.otpUsed = true;
    user.otpInfo.otp = "";
    user.otpInfo.otpExpires = "";
    user.resetToken = "";

    await user.save();

    const [updatedUser, token] = await Promise.all([
      User.findById(user._id),
      user.generateAuthToken(),
    ]);

    const userObject = updatedUser.toJSON();

    const response = formatUserResponse(userObject, token);

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "password_has",
      data: response,
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "an_error_1",
      error: error,
    });
  }
};

// The signed in user's own profile. Every role may read itself, which is what
// a client calls on relaunch to rehydrate the session behind its token.
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "account_not_found",
      });
    }

    if (["deleted", "suspended"].includes(user.accountState?.status)) {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "your_account_2",
      });
    }

    const userObject = User.prototype.toJSON.call(user, user);

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "profile_fetched_successfully",
      data: formatUserResponse(userObject, null, [], ["resetToken"]),
    });
  } catch (error) {
    const readableError = getReadableErrorMessage(error);
    return sendResponse({
      res,
      statusCode: readableError.statusCode,
      translationKey: readableError.message,
      error,
    });
  }
};

const logout = async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user._id;

    await Devices.updateOne(
      { userId: userId },
      { $pull: { devices: { deviceId: deviceId } } },
    );

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "logged_out",
    });
  } catch (err) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: err.message,
      error: err.message,
    });
  }
};

const hardDeleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const email = req.user.email;

    const randomEmail = `deleted_user_${userId}_${Date.now()}@example.com`;

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          email: randomEmail,
          previousEmail: email,
          phoneNumber: { code: "", number: "" },
          profileIcon: "noimage.png",
          "accountState.status": "deleted",
        },
      },
      { new: true },
    );

    await Devices.updateOne(
      { userId: userId },
      { $set: { devices: [] } },
    );

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "account_deleted",
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: error.message,
      error: error,
    });
  }
};

const socialAuth = async (req, res) => {
  let {
    provider,
    socialId,
    email,
    name,
    deviceId,
    deviceType,
    timezone,
    userType,
  } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validationOptions = {
      rawData: [
        "provider",
        "socialId",
        "name",
        "deviceId",
        "deviceType",
        "timezone",
        "userType",
      ],
      enumFields: {
        provider: ["google", "facebook", "apple"],
        userType: ["user", "coach"],
      },
    };

    if (!validateParams(req, res, validationOptions)) {
      return;
    }

    if (!email) {
      if (provider === "google") {
        email = `${socialId}@google.com`;
      } else if (provider === "facebook") {
        email = `${socialId}@facebook.com`;
      } else if (provider === "apple") {
        email = `${socialId}@apple.com`;
      }
    }

    if (!validator.isEmail(email)) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "invalid_email",
        values: { field: "email" },
      });
    }

    email = email.trim().toLowerCase();
    let existingUser = await User.findOne({
      $or: [{ [`${provider}Id`]: socialId }, { email }],
    });

    let providerLinked = false;
    if (existingUser) {
      if (existingUser.accountState.status === "suspended") {
        return sendResponse({
          res,
          statusCode: 403,
          translationKey: "your_account_2",
        });
      }

      if (provider === "google" && !existingUser.googleId) {
        existingUser.googleId = socialId;
        providerLinked = true;
      } else if (provider === "facebook" && !existingUser.facebookId) {
        existingUser.facebookId = socialId;
        providerLinked = true;
      } else if (provider === "apple" && !existingUser.appleId) {
        existingUser.appleId = socialId;
        providerLinked = true;
      }

      if (req.body.email && existingUser.email !== req.body.email) {
        existingUser.email = email;
        existingUser.verificationStatus.email = "verified";
      }

      existingUser.provider = provider;
      existingUser.timezone = timezone;
      existingUser.accountState.status = "active";
      if (name !== undefined) {
        existingUser.name = name;
      }

      await existingUser.save({ session });
      const token = existingUser.generateAuthToken();

      const userObject = new User(existingUser).toJSON();

      const response = formatUserResponse(userObject, token);

      if (
        typeof deviceId === "string" &&
        deviceId.trim() &&
        deviceId !== "test" &&
        typeof deviceType === "string"
      ) {
        createOrSkipDevice(existingUser._id, deviceId, deviceType);
      }

      await session.commitTransaction();
      session.endSession();

    let onboardesAsCoach = false;
    let onboardedAsAthlete = false;
    onboardedAsAthlete = await UsersOnboardingResponsesModel.findOne({
      user: existingUser._id,
    });
    onboardesAsCoach = await CoachOnboardingResponses.findOne({
      user: existingUser._id,
    });
    response.onboardedAsCoach = onboardesAsCoach ? true : false;
    response.onboardedAsAthlete = onboardedAsAthlete ? true : false;

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "login_success",
        data: response,
      });
    } else {
      const newUser = new User({
        email,
        name,
        provider,
        [`${provider}Id`]: socialId,
        timezone,
        verificationStatus: {
          email: "verified",
        },
        accountState: { userType: userType, status: "active" },
      });

      await newUser.save({ session });

      const token = newUser.generateAuthToken();

      const jUser = newUser.toJSON();
      const response = formatUserResponse(jUser, token);

      if (
        typeof deviceId === "string" &&
        deviceId.trim() &&
        deviceId !== "test" &&
        typeof deviceType === "string"
      ) {
        createOrSkipDevice(newUser._id, deviceId, deviceType);
      }

      await session.commitTransaction();
      session.endSession();

      return sendResponse({
        res,
        statusCode: 201,
        translationKey: "signup_successful",
        data: response,
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: error.message,
      error: error,
    });
  }
};

const checkEmailExistsAndVerified = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "missing_email",
      });
    }
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("verificationStatus");
    const existsAndVerified = !!(
      user && user.verificationStatus.email === "verified"
    );
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "email_check_success",
      data: { exists: existsAndVerified },
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server_error",
      error,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { subAdmin } = req.query;

    const userId =new mongoose.Types.ObjectId(subAdmin ? subAdmin : req.user._id);


    const validationOptions = {
      rawData: ["oldPassword", "newPassword"],
      minLengthFields: {
        newPassword: 6, // New password must be at least 6 characters long
      },
    };
    if (!validateParams(req, res, validationOptions)) {
      return;
    }
    const user = await User.findById(userId).select("password");

    if (!user) {
      return sendResponse({
        res,
        statusCode: 404,
        translationKey: "user_not_found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "incorrect_old_password",
      });
    }

    user.password = newPassword;
    await user.save();

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "password_changed_successfully",
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "an_error_occurred",
      error,
    });
  }
};

const checkUserNameExists = async (req, res) => {
  try {
    const { username } = req.body;

    if (!validateParams(req, res, { rawData: ["username"] })) return;

    const user = await User.findOne({ username: username }).select("_id");

    if (user) {
      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "username_already_taken",
        data: { exists: true },
      });
    }

    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "username_available",
      data: { exists: false },
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server_error",
      error,
    });
  }
};

module.exports = {
  getMe,
  createAdmin,
  register,
  companyDetails,
  login,
  generateOtp,
  verifyOtp,
  verifyEmailViaLink,
  resendEmailVerificationLink,
  sendPasswordResetLink,
  verifyPasswordResetLink,
  resetPasswordViaLink,
  resetPassword,
  logout,
  hardDeleteAccount,
  socialAuth,
  checkEmailExistsAndVerified,
  changePassword,
  checkUserNameExists,
  loginTest,
};
