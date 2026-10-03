const EngagementEvents = require("@EngagementEventsModel");
const { default: mongoose } = require("mongoose");
const { generateMeta } = require("../../helperUtils/responseUtil");
const { pipeline } = require("supertest/lib/test");

const EVENT_TTL_HOURS = {
  profile_view: 24,
  package_view: 24,
  service_view: 24,
  engaged_click: 6,
};

const getSinceDateForEventType = (eventType) => {
  const hours = EVENT_TTL_HOURS[eventType];
  if (!hours) return null;

  return new Date(Date.now() - hours * 60 * 60 * 1000);
};

const buildEventTypeCondition = (eventTypeOrList) => {
  if (Array.isArray(eventTypeOrList)) {
    return {
      $or: [
        { eventType: { $in: eventTypeOrList } },
        { action: { $in: eventTypeOrList } },
      ],
    };
  }

  return {
    $or: [{ eventType: eventTypeOrList }, { action: eventTypeOrList }],
  };
};

const logEngagement = async ({
  entityType,
  entityId,
  eventType,
  userId = null,
  ownerUserId = null,
  anonymousId = null,
  sessionId = null,
  metadata = null,
  dedupeHourBucket = null,
  createdAt = new Date(),
}) => {
  if (eventType === "profile_save") {
    try {
      return await EngagementEvents.create({
        entityType,
        entityId,
        eventType,
        userId,
        ownerUserId,
        anonymousId,
        sessionId,
        metadata,
        dedupeHourBucket,
        createdAt,
      });
    } catch (err) {
      if (err.code === 11000) return null;
      throw err;
    }
  }

  if (eventType === "share") {
    return EngagementEvents.create({
      entityType,
      entityId,
      eventType,
      userId,
      ownerUserId,
      anonymousId,
      sessionId,
      metadata,
      dedupeHourBucket,
      createdAt,
    });
  }

  const since = getSinceDateForEventType(eventType);

  if (userId && since) {
    const exists = await EngagementEvents.exists({
      entityType,
      entityId,
      ...buildEventTypeCondition(eventType),
      userId,
      createdAt: { $gte: since },
    });

    if (exists) return null;
  }

  return EngagementEvents.create({
    entityType,
    entityId,
    eventType,
    userId,
    ownerUserId,
    anonymousId,
    sessionId,
    metadata,
    dedupeHourBucket,
    createdAt,
  });
};

const countEngagementsByEntity = async ({
  entityType,
  entityId,
  eventType,
  since = null,
}) => {
  const query = {
    entityType,
    entityId,
    ...buildEventTypeCondition(eventType),
  };
  if (since) query.createdAt = { $gte: since };
  return EngagementEvents.countDocuments(query);
};

const getTrendingEntities = async ({
  entityType,
  eventType = "profile_view",
  since,
  limit = 10,
}) => {
  const eventCondition = buildEventTypeCondition(eventType);

  return EngagementEvents.aggregate([
    {
      $match: {
        entityType,
        ...eventCondition,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: "$entityId",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
};

const deleteEngagementsBefore = async (beforeDate) => {
  return EngagementEvents.deleteMany({
    createdAt: { $lt: beforeDate },
  });
};

const getEngagementCountsByEntity = async ({
  entityType,
  entityId,
  eventTypes = [],
  since = null,
}) => {
  if (!eventTypes.length) return {};

  const matchStage = {
    entityType,
    entityId: new mongoose.Types.ObjectId(entityId),
    ...buildEventTypeCondition(eventTypes),
  };

  if (since) {
    matchStage.createdAt = { $gte: since };
  }

  const results = await EngagementEvents.aggregate([
    { $match: matchStage },

    {
      $group: {
        _id: { $ifNull: ["$eventType", "$action"] },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = eventTypes.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {});

  for (const row of results) {
    stats[row._id] = row.count;
  }

  return stats;
};

const getWeeklyEngagementStats = async ({
  entityType,
  entityId,
  eventType,
}) => {
  const entityObjectId =
    typeof entityId === "string"
      ? new mongoose.Types.ObjectId(entityId)
      : entityId;

  const now = new Date();
  const utcDay = now.getUTCDay();
  const diffToMonday = utcDay === 0 ? -6 : 1 - utcDay;

  const weekStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + diffToMonday,
      0,
      0,
      0,
    ),
  );

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  const results = await EngagementEvents.aggregate([
    {
      $match: {
        entityType,
        entityId: entityObjectId,
        ...buildEventTypeCondition(eventType),
        createdAt: { $gte: weekStart, $lt: weekEnd },
      },
    },
    {
      $addFields: {
        dayOfWeek: { $isoDayOfWeek: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$dayOfWeek",
        count: { $sum: 1 },
      },
    },
  ]);

  const dayMap = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    7: "Sun",
  };

  const base = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  for (const row of results) {
    base[dayMap[row._id]] = row.count;
  }

  return Object.entries(base).map(([day, visitors]) => ({
    day,
    visitors,
  }));
};

const getLeadsByOwnerUser = async ({
  ownerUserId,
  eventTypes = [
    "profile_view",
    "package_view",
    "service_view",
    "engaged_click",
    "inquiry",
    "profile_save",
  ],
  since,
  until,
  page = 1,
  limit = 20,
  keyword,
}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  const matchStage = {
    ...buildEventTypeCondition(eventTypes),
  };

  if (ownerUserId) {
    matchStage.ownerUserId = new mongoose.Types.ObjectId(ownerUserId);
  }

  if (since || until) {
    matchStage.createdAt = {};

    if (since) {
      matchStage.createdAt.$gte = since;
    }

    if (until) {
      matchStage.createdAt.$lte = until;
    }
  }
  const pipeline = [
    {
      $match: matchStage,
    },

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
              profileIcon: 1,
              email: 1,
            },
          },
        ],
        as: "userId",
      },
    },
    {
      $unwind: {
        path: "$userId",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "ownerUserId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
              profileIcon: 1,
            },
          },
        ],
        as: "ownerUserId",
      },
    },
    {
      $unwind: {
        path: "$ownerUserId",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "coachservices",
        localField: "entityId",
        pipeline: [
          {
            $project: {
              serviceName: 1,
            },
          },
        ],
        foreignField: "_id",
        as: "service",
      },
    },
    {
      $unwind: {
        path: "$service",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "bookings",
        localField: "entityId",
        pipeline: [
          {
            $project: {
              packageName: 1,
            },
          },
        ],
        foreignField: "_id",
        as: "booking",
      },
    },
    {
      $unwind: {
        path: "$booking",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (keyword) {
    pipeline.push({
      $match: {
        $or: [
          {
            "userId.name": {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            "ownerUserId.name": {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            "service.serviceName": {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            "booking.packageName": {
              $regex: keyword,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  const countPipeline = [
    ...pipeline,
    {
      $count: "total",
    },
  ];

  pipeline.push(
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: safeLimit,
    },
  );

  const [events, groupedByType, totalResult] = await Promise.all([
    EngagementEvents.aggregate(pipeline),

    EngagementEvents.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    EngagementEvents.aggregate(countPipeline),
  ]);

  const total = totalResult?.[0]?.total || 0;

  return {
    items: events,

    groupedByType: groupedByType.map((row) => ({
      eventType: row._id,
      count: row.count,
    })),

    meta: generateMeta(safePage, safeLimit, total),
  };
};

const getTotalEngagementEventsByOrganizationId = async (organizationId) => {
  try {
    const objectId = new mongoose.Types.ObjectId(organizationId);

    const eventCount = await EngagementEvents.countDocuments({
      entityType: "organizations",
      action: "view",
      entityId: objectId,
    });

    return eventCount;
  } catch (error) {
    console.error("Error fetching total engagement events:", error);
    return 0;
  }
};
const getEventsViewsStats = async (eventIds = [], since = null) => {
  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    return [];
  }

  const objectIds = eventIds.map((id) => new mongoose.Types.ObjectId(id));

  const matchStage = {
    entityType: "events",
    action: "view",
    entityId: { $in: objectIds },
  };

  if (since) {
    matchStage.createdAt = { $gte: since };
  }

  const results = await EngagementEvents.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$entityId",
        totalViews: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        event: "$_id",
        totalViews: 1,
      },
    },
  ]);

  return results;
};

const getUserIdsForOrganization = async (eventId) => {
  try {
    const users = await EngagementEvents.aggregate([
      {
        $match: {
          entityType: "events",
          entityId: new mongoose.Types.ObjectId(eventId),
        },
      },
      {
        $group: {
          _id: null,
          userIds: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]);

    return users.length > 0 ? users[0].userIds : [];
  } catch (err) {
    console.error("Error fetching user IDs:", err);
    return [];
  }
};
const getUserIdsForOrganizationOrganizaerView = async (organization) => {
  try {
    const users = await EngagementEvents.aggregate([
      {
        $match: {
          entityType: "organizations",
          entityId: new mongoose.Types.ObjectId(organization),
        },
      },
      {
        $group: {
          _id: null,
          userIds: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          userIds: 1,
        },
      },
    ]);

    return users.length > 0 ? users[0].userIds : [];
  } catch (err) {
    console.error("Error fetching user IDs:", err);
    return [];
  }
};
module.exports = {
  logEngagement,
  getUserIdsForOrganization,
  countEngagementsByEntity,
  getTrendingEntities,
  getUserIdsForOrganizationOrganizaerView,
  deleteEngagementsBefore,
  getEngagementCountsByEntity,
  getLeadsByOwnerUser,
  getWeeklyEngagementStats,
  getTotalEngagementEventsByOrganizationId,
  getEventsViewsStats,
};
