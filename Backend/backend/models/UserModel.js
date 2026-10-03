const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const validator = require("validator");
const { randomBytes } = require("crypto");
const { LocationSchema } = require("../shared/locations/locationSchmea");
const { generateSecureToken } = require("../helperUtils/secureToken");
const {
  createVerificationLink,
  createResetPasswordLink,
  generateResetToken,
} = require("./userModelHelpers");


const USER_TYPES = [
  "guest",
  "student",
  "admin",
];
const GENDER_TYPES = ["Male", "Female", "Other"];

const userSchema = new mongoose.Schema(
  {
    profileIcon: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: GENDER_TYPES,
      default: "Other",
    },

    username: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    location: {
      type: LocationSchema,
      default: {},
    },

    referralCode: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: [true, "email_required"],
      unique: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "email_invalid",
      },
    },
    emailVerification: {
      tokenHash: String,
      expiresAt: Number,
      used: {
        type: Boolean,
        default: false,
      },
      otpRequestCount: {
        type: Number,
        default: 0,
      },
      otpRequestTimestamp: {
        type: Date,
        default: Date.now,
      },
    },

    passwordReset: {
      tokenHash: String,
      expiresAt: Number,
      used: {
        type: Boolean,
        default: false,
      },
      otpRequestCount: {
        type: Number,
        default: 0,
      },
      otpRequestTimestamp: {
        type: Date,
        default: Date.now,
      },
    },

    phoneNumber: {
      code: {
        type: String,
        default: "",
      },
      number: {
        // Phone number without country code
        type: String,
        default: "",
      },
      default: {},
    },
    verificationStatus: {
      email: {
        type: String,
        enum: ["pending", "verified"],
        default: "pending",
      },
      phoneNumber: {
        type: String,
        enum: ["pending", "verified"],
        default: "pending",
      },

    },

    password: {
      type: String,
      default: "",
    },
    accountState: {
      userType: {
        type: String,
        enum: USER_TYPES,
        default: "student",
      },
      status: {
        type: String,
        enum: [
          "pending",
          "inactive",
          "active",
          "cancelled",
          "expired",
          "suspended",
          "deleted",
        ],
        default: "pending",
      },
      reason: {
        type: String,
        default: "",
      },
      blueTick: {
        isActive: {
          type: Boolean,
          default: false,
        },
        grantedAt: {
          type: Date,
          default: Date(),
        },
      },
    },

    otpInfo: {
      emailOtp: {
        otp: {
          type: String,
          default: "",
        },
        otpUsed: {
          type: Boolean,
          default: false,
        },
        otpExpires: {
          type: Date,
        },
        otpRequestCount: {
          type: Number,
          default: 0,
        },
        otpRequestTimestamp: {
          type: Date,
          default: Date.now,
        },
      },
      phoneNumberOtp: {
        otp: {
          type: String,
          default: "",
        },
        otpUsed: {
          type: Boolean,
          default: false,
        },
        otpExpires: {
          type: Date,
        },
        otpRequestCount: {
          type: Number,
          default: 0,
        },
        otpRequestTimestamp: {
          type: Date,
          default: Date.now,
        },
      },
    },

    resetToken: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    language: {
      type: String,
      default: "en",
    },

    blockedUsers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reportedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    provider: {
      type: String,
      enum: ["google", "facebook", "apple", "email"],
      default: "email",
    },
    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    appleId: {
      type: String,
      default: null,
    },
    twoFA: {
      secret: {
        type: String,
        default: null,
      },
      isEnabled: {
        type: Boolean,
        default: false,
      },
      isConfirmed: {
        type: Boolean,
        default: false,
      },
      enabledAt: {
        type: Date,
        default: null,
      },
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      bookingReminders: {
        type: Boolean,
        default: true,
      },
      profileviews: {
        type: Boolean,
        default: true,
      },
      messages: {
        type: Boolean,
        default: true,
      },

    },
    weeklyHours: {
      type: Number,
      default: 0,
    },
    lastSignedIn: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  if (user.isModified("email")) {
    user.email = user.email.toLowerCase().trim();
  }

  next();
});


userSchema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
  });
  return token;
};

userSchema.statics.findByCredentials = async (
  email,
  password,
  userType,
  timezone,
  populateFields = []
) => {

  let query = User.findOne({ email: email.toLowerCase().trim() });

  populateFields.forEach((field) => {
    query = query.populate(field);
  });

  const user = await query;

  if (!user) {
    return { error: "user_not_found" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: "incorrect_password" };
  }

  if (timezone) {
    user.timezone = timezone;
    user.save();
  }

  return user;
};

userSchema.methods.generateOtp = function (type = "email", timezone = "UTC") {
  const user = this;
  const now = Date.now();
  const allowedOtpRequests = 3;

  let otpRequestCount, otpRequestTimestamp;

  if (type === "email") {
    otpRequestCount = user.otpInfo.emailOtp.otpRequestCount;
    otpRequestTimestamp = user.otpInfo.emailOtp.otpRequestTimestamp;
  } else if (type === "phoneNumber") {
    otpRequestCount = user.otpInfo.phoneNumberOtp.otpRequestCount;
    otpRequestTimestamp = user.otpInfo.phoneNumberOtp.otpRequestTimestamp;
  }

  const timeLimit = moment(otpRequestTimestamp).add(1, "hour").valueOf();
  if (now > timeLimit) {
    if (type === "email") {
      user.otpInfo.emailOtp.otpRequestCount = 0;
      user.otpInfo.emailOtp.otpRequestTimestamp = now;
    } else if (type === "phoneNumber") {
      user.otpInfo.phoneNumberOtp.otpRequestCount = 0;
      user.otpInfo.phoneNumberOtp.otpRequestTimestamp = now;
    }
  } else if (otpRequestCount >= allowedOtpRequests) {
    if (process.env.NODE_ENV == "prod") {
      return { error: "too_many_otp_requests" };
    }
  }

  if (type === "email") {
    user.otpInfo.emailOtp.otpRequestCount += 1;
  } else if (type === "phoneNumber") {
    user.otpInfo.phoneNumberOtp.otpRequestCount += 1;
  }

  const otp = (parseInt(randomBytes(3).toString("hex"), 16) % 1000000)
    .toString()
    .padStart(6, "0");

  const otpExpires = moment
    .tz(now, timezone)
    .add(type === "email" ? 10 : 5, "minutes")
    .valueOf();

  if (type === "email") {
    user.otpInfo.emailOtp.otp = otp;
    user.otpInfo.emailOtp.otpExpires = otpExpires;
    user.otpInfo.emailOtp.otpUsed = false;
  } else if (type === "phoneNumber") {
    user.otpInfo.phoneNumberOtp.otp = otp;
    user.otpInfo.phoneNumberOtp.otpExpires = otpExpires;
    user.otpInfo.phoneNumberOtp.otpUsed = false;
  }

  return otp;
};

userSchema.methods.generateEmailVerificationToken = function (
  timezone = "UTC"
) {
  const user = this;
  const now = Date.now();

  const allowedRequestsPerHour = 10;
  const lastTimestamp = user.otpInfo?.emailOtp?.otpRequestTimestamp || 0;
  const count = user.otpInfo?.emailOtp?.otpRequestCount || 0;
  if (process.env.NODE_ENV !== "dev") {
    if (
      now < moment(lastTimestamp).add(1, "hour").valueOf() &&
      count >= allowedRequestsPerHour
    ) {
      return { error: "too_many_verification_requests" };
    }
  }

  user.otpInfo.emailOtp.otpRequestTimestamp = now;
  user.otpInfo.emailOtp.otpRequestCount = count + 1;

  const { rawToken, hashedToken } = generateSecureToken();

  const expiresAt = moment.tz(now, timezone).add(10, "minutes").valueOf();

  user.emailVerification = {
    tokenHash: hashedToken,
    expiresAt,
    used: false,
  };
  const verificationLink = createVerificationLink(rawToken);
  return {
    verificationLink,
    rawToken,
  };
};

userSchema.methods.generatePasswordResetToken = function (timezone = "UTC") {
  const user = this;
  const now = Date.now();

  if (!user.passwordReset) {
    user.passwordReset = {};
  }
  const allowedRequestsPerHour = 3;
  const lastTimestamp = user.passwordReset?.otpRequestTimestamp || 0;
  const count = user.passwordReset?.otpRequestCount || 0;
  if (process.env.NODE_ENV !== "dev") {
    if (
      now < moment(lastTimestamp).add(1, "hour").valueOf() &&
      count >= allowedRequestsPerHour
    ) {
      return { error: "too_many_password_reset_requests" };
    }
  }

  const { rawToken, hashedToken } = generateSecureToken();

  const expiresAt = moment.tz(now, timezone).add(15, "minutes").valueOf();

  user.passwordReset.otpRequestTimestamp = now;
  user.passwordReset.otpRequestCount = count + 1;
  user.passwordReset.tokenHash = hashedToken;
  user.passwordReset.expiresAt = expiresAt;
  user.passwordReset.used = false;

  const resetLink = createResetPasswordLink(rawToken);

  return {
    resetLink,
    rawToken,
  };
};

userSchema.methods.toJSON = function (userData) {
  let userObject;

  if (userData) {
    userObject = { ...userData };
  } else if (typeof this.toObject === "function") {
    userObject = this.toObject();
  } else {
    userObject = { ...this };
  }

  // profileIcon is handed back as the stored file name. The client composes the
  // url from the media base url, so moving storage never strands old rows.

  delete userObject.password;

  if (process.env.NODE_ENV === "prod") {
    delete userObject.otpInfo;
    delete userObject.emailVerification;
  }

  return userObject;
};

userSchema.index(
  {
    email: 1,
    "accountState.userType": 1
  },
  {
    name: "email_userType_login_idx"
  }
);

// Only index users that actually carry coordinates. Without the partial filter
// the default location ({ type: "Point", coordinates: [] }) is invalid GeoJSON
// and every insert fails with "Can't extract geo keys".
userSchema.index(
  { location: "2dsphere" },
  {
    partialFilterExpression: { "location.coordinates.0": { $exists: true } },
  },
);
userSchema.index({ createdAt: 1, "accountState.status": 1 });

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  generateResetToken,
  createVerificationLink,
  USER_TYPES,
  GENDER_TYPES,
};
