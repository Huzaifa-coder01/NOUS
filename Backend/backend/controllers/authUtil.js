const { validateParams, sendResponse, getReadableErrorMessage } = require("../helperUtils/responseUtil");
const { formatUserResponse } = require("../helperUtils/userResponseUtil");
const { createOrSkipDevice } = require("../models/Devices");
const { User, USER_TYPES } = require("../models/UserModel");
const { validatePhoneNumber } = require("../helperUtils/validationsUtil");
const { sendEmailViaBrevo } = require("../helperUtils/emailUtil");
const { registrationViaLinkEmailTemplate, registrationViaOtpEmailTemplate } = require("../helperUtils/emailTemplates");
const { defaultSetNotificationPreferences } = require("./notificationPreferencesController");


const registerUserUtility = async (req, res, options = {}) => {
  const {
    autoVerify = false,
    allowAdminCreation = true,

  } = options;

  let {
    email,
    phoneNumber,
    profileIcon,
    userType = "student",
    name,
    password,
    timezone,
    username,
    gender,
    dob,
    deviceId,
    deviceType,
    location,
  } = req.body;

  const accountStatus = autoVerify ? "active" : "pending";

  try {
    let rawData = ["email", "password", "userType"];
    let objectIdFields = [];
    let dateFields = {};

    const allowedUserTypes = USER_TYPES.filter((type) => type !== "admin");

    if (options.allowAdminCreation) {
      allowedUserTypes.push("admin");
    }


    const validationOptions = {
      rawData,
      objectIdFields,
      dateFields,
      enumFields: {
        userType: allowedUserTypes,
        gender: ["", "Male", "Female", "Other"]
      },
      minLengthFields: { password: 6 },
    };

    if (!validateParams(req, res, validationOptions)) {
      return { responseSent: true };
    }

    if (profileIcon && profileIcon.startsWith("http")) {
      sendResponse({
        res,
        statusCode: 400,
        translationKey: "url_not_accepted",
        values: { field: "profileIcon" },
      });

      return { responseSent: true };
    }

    if (userType === "guest") {
      const adminToken = req.header("x-admin-access-token");
      if (adminToken !== process.env.ADMIN_ACCESS_TOKEN) {
        sendResponse({
          res,
          statusCode: 401,
          translationKey: "unauthorized_to_perform_this_action",
        });

        return { responseSent: true };
      }
    }

    if (req.body.userType === "admin") {
      const adminToken = req.header("x-admin-access-token");
      if (
        !options.allowAdminCreation ||
        adminToken !== process.env.ADMIN_ACCESS_TOKEN
      ) {
        sendResponse({
          res,
          statusCode: 403,
          translationKey: "unauthorized_to_create_admin",
        });

        return { responseSent: true };
      }
    }


    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser && existingUser.verificationStatus.email === "verified") {
      sendResponse({
        res,
        statusCode: 400,
        translationKey: "email_already",
      });
      return { responseSent: true };
    }

    if (phoneNumber) {
      if (
        typeof phoneNumber !== "object" ||
        !phoneNumber.code ||
        !phoneNumber.number ||
        !validatePhoneNumber(`${phoneNumber.code}${phoneNumber.number}`).valid
      ) {
        sendResponse({ res, statusCode: 400, translationKey: "invalid_phone" });
        return { responseSent: true };
      }

      const existingPhone = await User.findOne({
        "phoneNumber.code": phoneNumber.code,
        "phoneNumber.number": phoneNumber.number,
        "verificationStatus.phoneNumber": "verified",
      });
      if (existingPhone) {
        sendResponse({
          res,
          statusCode: 400,
          translationKey: "phone_number_already",
        });
        return { responseSent: true };
      }
    }

    let user = existingUser || new User();

    Object.assign(user, {
      email,
      phoneNumber: phoneNumber || { code: "", number: "" },
      profileIcon,
      name,
      username,
      gender,
      dob,
      password,
      ...(timezone ? { timezone } : {}),
      ...(location ? { location } : {}),
      accountState: { userType, status: accountStatus },
      verificationStatus: {
        email: autoVerify ? "verified" : "pending",
        phoneNumber: "pending",
      },
    });

    let emailVerificationLink = null;
    if (!autoVerify) {
      const otp = user.generateOtp("email", user.timezone);
      const mBody = registrationViaOtpEmailTemplate(otp);
      await sendEmailViaBrevo([user.email], "Email Verification", mBody);
    }

    await user.save();

    defaultSetNotificationPreferences(user._id);


    if (deviceId && deviceType && deviceId !== "test") {
      createOrSkipDevice(user._id, deviceId, deviceType);
    }

    const userObject = user.toJSON();
    if (emailVerificationLink) {
      userObject.emailVerificationLink = emailVerificationLink;
    }
    const formattedResponse = formatUserResponse(userObject);

    return { success: true, user: formattedResponse, responseSent: false };
  } catch (error) {
    if (error?.code === 11000) {
      const key = Object.keys(error?.keyPattern || {})[0];
      let translationKey = "duplicate_key";

      if (key === "email") translationKey = "email_already";
      if (key === "phoneNumber.code" || key === "phoneNumber.number") {
        translationKey = "phone_number_already";
      }

      sendResponse({
        res,
        statusCode: 400,
        translationKey,
        error,
      });

      return { responseSent: true };
    }

    const readableError = getReadableErrorMessage(error);
    sendResponse({
      res,
      statusCode: readableError.statusCode,
      translationKey: readableError.message,
      error,
    });
    return { responseSent: true };
  }
};

module.exports = { registerUserUtility };