const mongoose = require("mongoose");

const toObjectIds = (ids) =>
  ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

const rowsToMap = (rows) =>
  rows.reduce((acc, row) => {
    acc[String(row._id)] = row.count;
    return acc;
  }, {});

const activeChildCounts = async (
  childModel,
  parentField,
  parentIds,
  extraMatch = {},
) => {
  const ids = toObjectIds(parentIds);
  if (!ids.length) return {};

  const rows = await childModel.aggregate([
    {
      $match: {
        ...extraMatch,
        [parentField]: { $in: ids },
        status: "active",
      },
    },
    {
      $group: {
        _id: "$" + parentField,
        count: { $sum: 1 },
      },
    },
  ]);

  return rowsToMap(rows);
};

const activeGrandchildCounts = async (
  middleModel,
  middleParentField,
  grandchildCollection,
  grandchildParentField,
  parentIds,
) => {
  const ids = toObjectIds(parentIds);
  if (!ids.length) return {};

  const rows = await middleModel.aggregate([
    {
      $match: {
        [middleParentField]: { $in: ids },
        status: { $ne: "deleted" },
      },
    },
    {
      $lookup: {
        from: grandchildCollection,
        let: { middleId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$" + grandchildParentField, "$$middleId"],
              },
              status: "active",
            },
          },
          {
            $count: "count",
          },
        ],
        as: "grandchildren",
      },
    },
    {
      $group: {
        _id: "$" + middleParentField,
        count: {
          $sum: {
            $ifNull: [{ $arrayElemAt: ["$grandchildren.count", 0] }, 0],
          },
        },
      },
    },
  ]);

  return rowsToMap(rows);
};

const attachContentCount = (records, countMaps) => {
  return records.map((record) => {
    const contentCount = {};
    for (const [key, map] of Object.entries(countMaps)) {
      contentCount[key] = map[String(record._id)] || 0;
    }
    return { ...record, contentCount };
  });
};

module.exports = {
  activeChildCounts,
  activeGrandchildCounts,
  attachContentCount,
};
