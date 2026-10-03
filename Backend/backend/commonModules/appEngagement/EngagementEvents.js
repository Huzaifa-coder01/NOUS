const mongoose = require("mongoose");

const engagementEventSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["coachservices", "users", "message", "profile_view"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityModel",
    },
    entityModel: {
      type: String,
      default: function () {
        const map = {
          profile_view: "User",
          package_view: "Booking",
          service_view: "CoachServices",
        };

        return map[this.eventType] || "User";
      },
    },

    eventType: {
      type: String,
      enum: [
        "profile_view",
        "package_view",
        "service_view",
        "engaged_click",
        "message",
        "request",
        "profile_save",
        "share",
      ],
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    anonymousId: {
      type: String,
      index: true,
    },

    sessionId: {
      type: String,
      index: true,
    },

    metadata: {
      source: String,
      device: String,
      campaignId: String,
      extra: mongoose.Schema.Types.Mixed,
    },

    dedupeHourBucket: {
      type: Date,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

engagementEventSchema.index({
  entityType: 1,
  entityId: 1,
  eventType: 1,
  createdAt: -1,
});

engagementEventSchema.index({
  createdAt: -1,
});

engagementEventSchema.index(
  { userId: 1, entityType: 1, entityId: 1, eventType: 1 },
  {
    unique: true,
    partialFilterExpression: { eventType: "profile_save" },
  },
);

engagementEventSchema.index(
  {
    userId: 1,
    entityType: 1,
    entityId: 1,
    eventType: 1,
    dedupeHourBucket: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $exists: true },
      dedupeHourBucket: { $exists: true },
    },
  },
);

engagementEventSchema.index({
  entityType: 1,
  entityId: 1,
});

engagementEventSchema.index({
  ownerUserId: 1,
  eventType: 1,
  createdAt: -1,
});

const EngagementEvents = mongoose.model(
  "EngagementEvents",
  engagementEventSchema,
);
module.exports = EngagementEvents;
