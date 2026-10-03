const mongoose = require("mongoose");

const notificationPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    pushNotifications: {
      type: Boolean,
      default: true,
    },

    profileViewAlerts: {
      type: Boolean,
      default: true,
    },

    messageAlerts: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const NotificationPreferences = mongoose.model(
  "NotificationPreferences",
  notificationPreferencesSchema
);

module.exports = NotificationPreferences;