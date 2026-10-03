const { buildKeywordQueryFromModels } = require("@helperUtils/dbUtils/queryUtil");
const SupportRequest = require("@SupportRequestModel");
const { generateMeta } = require("@helperUtils/responseUtil");
const { User } = require("@UsersModel");
const { formatUpdate } = require("./helper/helper");


const getSupportRequest = async ({ timezone, page, limit, keyword, status, userId, date, skip }) => {

  const pipeline = [];

  if (status) {
    pipeline.push({ $match: { status } });
  } else {
    pipeline.push({ $match: { status: { $ne: "deleted" } } });
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(new Date(date).setDate(start.getDate() + 1));
    pipeline.push({
      $match: {
        createdAt: { $gte: start, $lt: end }
      }
    });
  }

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      pipeline: [
        { $project: { name: 1, email: 1, profileIcon: 1 } }
      ],
      as: 'user',
    },
  });

  pipeline.push({
    $unwind: {
      path: '$user',
      preserveNullAndEmptyArrays: true, // Keep the support request even if no user is found
    },
  });
  if (keyword) {
    pipeline.push({
      $match: {
        $or: [
            { subject: { $regex: keyword, $options: 'i' } },
          { message: { $regex: keyword, $options: 'i' } },

          { 'user.name': { $regex: keyword, $options: 'i' } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  pipeline.push({
    $facet: {
      data: [
        { $skip: skip },
        ...(limit === 0 ? [] : [{ $limit: limit }])
      ],
      totalFiltered: [{ $count: "count" }]
    }
  });

  const result = await SupportRequest.aggregate(pipeline);

  let supportRequests = result[0]?.data || [];
  const totalFiltered = result[0]?.totalFiltered[0]?.count || 0;

  const [total, deleted, pending, responded, resolved, closed] = await Promise.all([
    SupportRequest.countDocuments({
      ...(userId && { userId: userId }),
      status: { $ne: "deleted" },
    }),
    SupportRequest.countDocuments({
      status: "deleted",
      ...(userId && { userId: userId }),
    }),
    SupportRequest.countDocuments({
      status: "pending",
      ...(userId && { userId: userId }),
    }),
    SupportRequest.countDocuments({
      status: "responded",
      ...(userId && { userId: userId }),
    }),
    SupportRequest.countDocuments({
      status: "resolved",
      ...(userId && { userId: userId }),
    }),
    SupportRequest.countDocuments({
      status: "closed",
      ...(userId && { userId: userId }),
    }),
  ]);

  const meta = generateMeta(page, limit, totalFiltered);
  meta.supportRequestsCount = { total, pending, responded, resolved, closed, deleted };
const formattedSupportRequests = supportRequests.map(formatUpdate);
  return { supportRequests: formattedSupportRequests, meta };
};
module.exports = {
  getSupportRequest
};