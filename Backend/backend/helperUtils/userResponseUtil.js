const { notify } = require("@appEngagement/engagementEventsRoutes");
const { createVerificationLink } = require("../models/UserModel");
const { getFileName } = require("@helperUtils/imageHelper");

const formatUserResponse = (
  userObject,
  token = null,
  includeFields = [],
  excludeFields = [],
) => {

  if (!userObject) return null;
    const subAdmin =
      userObject.orignalUserType === "subAdmin"
        ? {
            permissions: userObject.permissions,
            orignalUserType: userObject.orignalUserType,
            orignalSubAdminId: userObject.orignalSubAdminId,
          }
        : null;
  const pIcon = getFileName(userObject?.profileIcon) || null;
  const userType = userObject.accountState?.userType;
  const basicInfo = {
    _id: userObject._id,
    profileIcon: pIcon,
    name: userObject.name,
    email: userObject.email,
    phoneNumber: userObject.phoneNumber || "",
    language: userObject.language,
    country: userObject.country,
    isOnboardingCompletedDoc: userObject.isOnboardingCompletedDoc,
  };
  const location = userObject.location || null;

  let response = {
    basicInfo,
    accountState: {
      twoFactorAuth: userObject.twoFA?.isEnabled || false,
      userType: userType || "user",
      status: userObject.accountState?.status || "active",
      verificationStatus: {
        email: userObject.verificationStatus?.email || "pending",
        phoneNumber: userObject.verificationStatus?.phoneNumber || "pending",
      },
      blueTick: userObject.accountState?.blueTick?.isActive || false,
    },
    location,
    ...(subAdmin ? { subAdmin } : {}),


    metadata: {
      timezone: userObject.timezone,
      createdAt: userObject.createdAt,
      updatedAt: userObject.updatedAt,
      __v: userObject.__v,
    },
  };

  if (userType == "user") {
  } else if (userType == "admin") {
  }

  if (
    (process.env.NODE_ENV === "dev" ||
      process.env.NODE_ENV === "mobileapps" ||
      process.env.NODE_ENV === "localhost") &&
    userObject.otpInfo &&
    userObject.otpInfo.emailOtp.otp !== ""
  ) {
    response.otpInfo = userObject.otpInfo;
  }

  if (
    (process.env.NODE_ENV === "dev" ||
      process.env.NODE_ENV === "mobileapps" ||
      process.env.NODE_ENV === "localhost") &&
    userObject.emailVerificationLink
  ) {
    response.emailVerification = createVerificationLink(
      userObject.emailVerificationLink,
    );
  }

  if (userObject.resetToken) {
    response.resetToken = userObject.resetToken;
  }

  if (token) {
    response.token = token;
  }

  if (includeFields.length > 0) {
    const filtered = {};
    includeFields.forEach((field) => {
      if (response[field]) {
        filtered[field] = response[field];
      }
    });
    return filtered;
  }

  if (excludeFields.length > 0) {
    excludeFields.forEach((fieldPath) => {
      const [mainField, subField] = fieldPath.split(".");
      if (subField) {
        if (response[mainField]) {
          delete response[mainField][subField];
        }
      } else {
        delete response[fieldPath];
      }
    });
  }

  return response;
};

//attach url to profile icon without any other formatting
const formatUserProfileIconOnly = (userObject) => {
  if (!userObject) return null;
  const pIcon = getFileName(userObject?.profileIcon) || null;
  userObject.profileIcon = pIcon;
  return userObject;
};

module.exports = {
  formatUserResponse,
  formatUserProfileIconOnly,
};
