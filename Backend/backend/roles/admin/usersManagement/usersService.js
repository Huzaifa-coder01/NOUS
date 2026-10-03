const {
  generateMeta,
  sendResponse,
} = require("../../../helperUtils/responseUtil");
const userRepo = require("./usersRepository");
const { formatUserResponse } = require("../../../helperUtils/userResponseUtil");
const { userCache } = require("../../../config/nodeCache");
const { User } = require("../../../models/UserModel");
const { default: mongoose } = require("mongoose");
const {
  generate2FASecret,
  generateQRCode,
  verify2FAToken,
} = require("./twoFactorAuth");
const {
  buildKeywordQueryFromModels,
} = require("../../../helperUtils/dbUtils/queryUtil");
const { validatePhoneNumber } = require("../../../helperUtils/validationsUtil");
const {
  accountStatusEmailTemplate,
} = require("../../../helperUtils/emailTemplates");
const { sendEmailViaBrevo } = require("../../../helperUtils/emailUtil");
const { createOrSkipDevice } = require("../../../models/Devices");
const { formatAthletes } = require("./formator/formatAthletes");
const { findByIdAndUpdate } = require("../subAdmins/subAdminsRepository");

const APP_NAME = "CoachCritic App";

const getAllUsers = async ({ page, limit, keyword, status, userType }) => {
  const skip = (page - 1) * limit;

  const matchStage = {};

  if (status) {
    matchStage["accountState.status"] = status;
  } else {
    matchStage["accountState.status"] = { $ne: "deleted" };
  }

  if (userType) {
    matchStage["accountState.userType"] = userType;
  }

  if (keyword && keyword.trim() !== "") {
    const keywordMatch = buildKeywordQueryFromModels(
      [{ schema: User.schema }],
      keyword,
    );

    Object.assign(matchStage, keywordMatch);
  }

  const countByStatus = (value) => [
    { $match: { "accountState.status": value } },
    { $count: "count" },
  ];

  const pipeline = [
    {
      $match: matchStage,
    },

    {
      $facet: {
        users: [
          {
            $project: {
              _id: 1,
              name: 1,
              username: 1,
              email: 1,
              phoneNumber: 1,
              gender: 1,
              dob: 1,
              accountState: 1,
              verificationStatus: 1,
              profileIcon: 1,
              timezone: 1,
              language: 1,
              lastSignedIn: 1,
              createdAt: 1,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },

          {
            $skip: skip,
          },

          {
            $limit: limit,
          },
        ],

        total: [
          {
            $count: "count",
          },
        ],

        pending: countByStatus("pending"),
        active: countByStatus("active"),
        inactive: countByStatus("inactive"),
        suspended: countByStatus("suspended"),
      },
    },
  ];

  const result = await User.aggregate(pipeline);

  const data = result[0] || {};

  const users = data.users || [];
  const totalFiltered = data.total?.[0]?.count || 0;
  const pending = data.pending?.[0]?.count || 0;
  const active = data.active?.[0]?.count || 0;
  const inactive = data.inactive?.[0]?.count || 0;
  const suspended = data.suspended?.[0]?.count || 0;

  const countFilter = userType
    ? { "accountState.userType": userType }
    : {};
  const [totalRecord, deleted] = await Promise.all([
    User.countDocuments(countFilter),
    User.countDocuments({ ...countFilter, "accountState.status": "deleted" }),
  ]);

  const meta = generateMeta(page, limit, totalFiltered);

  meta.usersCount = {
    totalRecord,
    pending,
    active,
    inactive,
    suspended,
    deleted,
  };

  return {
    users: formatAthletes(users),
    meta,
  };
};


const updateUser = async (req, res, options = {}) => {
  const { userId } = options;
  const {
    permissions,
    validationDocument,
    companyName,
    type,
    phoneNumber,
    profileIcon,
    name,
    timezone,
    location,
    username,
    gender,
    registrationNumber,
    dob,
    deviceId,
    deviceType,
    status,
    notifications,
    blueTick,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    if (profileIcon && profileIcon.startsWith("http")) {
      return {
        errorCode: 400,
        message: "url_not_accepted",
        field: "profileIcon",
      };
    }

    if (phoneNumber) {
      if (
        typeof phoneNumber !== "object" ||
        !phoneNumber.code ||
        !phoneNumber.number
      ) {
        return { errorCode: 400, message: "invalid_phone" };
      }

      const existingPhone = await User.findOne({
        _id: { $ne: userId },
        "phoneNumber.code": phoneNumber.code,
        "phoneNumber.number": phoneNumber.number,
        "verificationStatus.phoneNumber": "verified",
      });

      if (existingPhone) {
        return { errorCode: 409, message: "phone_number_already" };
      }

      user.phoneNumber = phoneNumber;
      user.verificationStatus.phoneNumber = "pending";
    }
    if(companyName){
      user.companyName = companyName;
    }
    if(type){
      user.type = type;
    };
    if(registrationNumber){
      user.registrationNumber = registrationNumber;
    };
    if(location){
      user.location = location;
    };
    if(validationDocument){
      user.validationDocument = validationDocument;
    };

    if (name) user.name = name;
    if (profileIcon) user.profileIcon = profileIcon;
    if (timezone) user.timezone = timezone;
    if (username) user.username = username;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (status) user.accountState.status = status;
    if (blueTick !== undefined) {
      if (!user.accountState) user.accountState = {};
      if (!user.accountState.blueTick) {
        user.accountState.blueTick = {};
      }

      if (blueTick.isActive !== undefined) {
        user.accountState.blueTick.isActive = blueTick.isActive;
      }

      if (blueTick.grantedAt !== undefined) {
        user.accountState.blueTick.grantedAt = blueTick.grantedAt;
      }

      user.markModified("accountState.blueTick");
    }

    if (notifications && typeof notifications === "object") {
      const allowedKeys = [
        "email",
        "push",
        "bookingReminders",
        "profileviews",
        "messages",
      ];

      allowedKeys.forEach((key) => {
        if (notifications[key] !== undefined) {
          user.notifications[key] = notifications[key];
        }
      });
    }


    await user.save({ session });


    if (permissions) {
      await findByIdAndUpdate(userId, permissions);

    }

    if (deviceId && deviceType) {
      createOrSkipDevice(user._id, deviceId, deviceType);
    }

    if (status) {
      const mBody = accountStatusEmailTemplate(status, user.name);
      await sendEmailViaBrevo([user.email], "Account Status", mBody);
    }

    await session.commitTransaction();

    userCache.del(userId.toString());
    const userObject = user.toJSON();

    return formatUserResponse(userObject, null, [], ["resetToken"]);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteUser = async (id) => {
  const updated = await userRepo.findByIdAndUpdate(id, {
    "accountState.status": "deleted",
  });
  if (!updated) return null;
  userCache.del(id.toString());
  return true;
};

const getUserDetails = async (id) => {
  return await userRepo.findUserById(id);
};

const getUserDetailsForQRService = async (id) => {
  let data = await userRepo.getUserDetailsForQRRepo(id);
  return formatUserResponse(
    data,
    null,
    [],
    ["accountState", "preferences", "metadata"],
  );
};

const setupTwoFA = async (userId) => {
  const user = await userRepo.findUserById(userId, { twoFA: 1, email: 1 });

  let secret = user.twoFA?.secret;
  if (!secret) {
    const { secret: newSecret } = generate2FASecret(APP_NAME, user.email);
    secret = newSecret;

    await userRepo.updateTwoFA(userId, {
      "twoFA.secret": secret,
      "twoFA.isEnabled": false,
      "twoFA.isConfirmed": false,
    });
  }

  const otpauth = `otpauth://totp/${encodeURIComponent(APP_NAME)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(APP_NAME)}`;
  const qrCodeDataURL = await generateQRCode(otpauth);

  return { qrCodeDataURL, secret };
};

const confirmTwoFA = async (userId, token) => {
  const user = await userRepo.findUserById(userId, { twoFA: 1 });

  if (!user || !user.twoFA?.secret) {
    return { isValid: false, newlyEnabled: false };
  }

  const isValid = verify2FAToken(token, user.twoFA.secret);

  if (!isValid) {
    return { isValid: false, newlyEnabled: false };
  }

  const updatePayload = {
    "twoFA.isEnabled": true,
    "twoFA.isConfirmed": true,
    "twoFA.enabledAt": new Date(),
  };

  await userRepo.updateTwoFA(userId, updatePayload);

  userCache.del(userId.toString());

  return {
    isValid: true,
    newlyEnabled: !user.twoFA.isEnabled,
  };
};

const disableTwoFA = async (userId) => {
  await userRepo.updateTwoFA(userId, {
    "twoFA.isEnabled": false,
    "twoFA.isConfirmed": false,
  });
  return true;
};


const getAllAthletes = async ({
  page,
  limit,
  keyword,
  status,
  userType = "user",
}) => {
  const skip = (page - 1) * limit;

  const matchStage = {
    "verificationStatus.email": "verified",
  };

  if (status) {
    matchStage["accountState.status"] = status;
  } else {
    matchStage["accountState.status"] = { $ne: "deleted" };
  }

  if (userType !== undefined) {
    matchStage["accountState.userType"] = userType;
  }

  if (keyword && keyword.trim() !== "") {
    const keywordMatch = buildKeywordQueryFromModels(
      [{ schema: User.schema }],
      keyword,
    );

    Object.assign(matchStage, keywordMatch);
  }

  const pipeline = [
    {
      $match: matchStage,
    },

    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "user",
        pipeline: [
          {
            $match: {
              bookingStatus: {
                $nin: ["deleted", "cancelled", "rejected"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              bookingStatus: 1,
            },
          },
        ],
        as: "sessions",
      },
    },

    {
      $addFields: {
        totalSessions: {
          $size: "$sessions",
        },
      },
    },

    {
      $facet: {
        users: [
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              profileIcon: 1,
              accountState: 1,
              phoneNumber: 1,
              accountState: 1,
              createdAt: 1,
              totalSessions: 1,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },

          {
            $skip: skip,
          },

          {
            $limit: limit,
          },
        ],

        total: [
          {
            $count: "count",
          },
        ],
      },
    },
  ];

  const result = await User.aggregate(pipeline);

  const data = result[0] || {};

  const users = data.users || [];
  const totalFiltered = data.total?.[0]?.count || 0;

  const meta = generateMeta(page, limit, totalFiltered);

  return {
    users: formatAthletes(users),
    meta,
  };
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getUserDetails,
  setupTwoFA,
  confirmTwoFA,
  disableTwoFA,
  getUserDetailsForQRService,
  getAllAthletes,
};
