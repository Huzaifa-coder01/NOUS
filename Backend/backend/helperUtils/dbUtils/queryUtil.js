const mongoose = require("mongoose");

async function createWithAutoOrder({ model, data, orderField = "order", match = { status: { $ne: "deleted" } } }) {
  const lastDoc = await model.findOne(match).sort({ [orderField]: -1 }).select(orderField);
  const nextOrder = lastDoc ? lastDoc[orderField] + 1 : 1;
  const newDoc = new model({ ...data, [orderField]: nextOrder });
  return await newDoc.save();
}


function buildLookupPipeline(lookup) {
  if (!lookup.subLookups || !Array.isArray(lookup.subLookups)) return [];

  const stages = [];

  for (const sub of lookup.subLookups) {
    stages.push({
      $lookup: {
        from: sub.from,
        as: sub.as,
        let: { localField: `$${sub.localField}` },
        pipeline: [
          {
            $match: {
              $expr: {
                $cond: [
                  { $isArray: "$$localField" },
                  { $in: ["$_id", "$$localField"] },
                  { $eq: ["$_id", "$$localField"] },
                ],
              },
            },
          },
          ...(sub.project ? [{ $project: sub.project }] : []),
          ...buildLookupPipeline(sub),
        ],
      },
    });

    if (sub.single) {
      stages.push({
        $unwind: { path: `$${sub.as}`, preserveNullAndEmptyArrays: true },
      });
    }
  }

  return stages;
}


async function getWithFilters({
  model,
  query = {},
  populate = [],
  options = {},
  refPath,
  localField = "object",
  refLookups = {},
}) {
  const {
    sort = { createdAt: -1 },
    page = 1,
    limit = 10,
    select = null,
  } = options;

  const skip = limit === 0 ? 0 : (page - 1) * limit;
  const baseMatch = { $match: query };

  if (!refPath || Object.keys(refLookups).length === 0) {
    let q = model.find(query).sort(sort).skip(skip).limit(limit);
    if (select) q = q.select(select);
    populate.forEach((p) => (q = q.populate(p)));
    return q.lean().exec();
  }

  const typePipelines = Object.entries(refLookups).map(([type, lookup]) => {
    const lookupStage = {
      $lookup: {
        from: lookup.from,
        as: "object",
        let: { localField: `$${localField}` },
        pipeline: [
          {
            $match: {
              $expr: {
                $cond: [
                  { $isArray: "$$localField" },
                  { $in: ["$_id", "$$localField"] },
                  { $eq: ["$_id", "$$localField"] },
                ],
              },
            },
          },
          ...(lookup.project ? [{ $project: lookup.project }] : []),
          ...buildLookupPipeline(lookup),
        ],
      },
    };

    return [
      baseMatch,
      { $match: { [refPath]: type } },
      lookupStage,
      {
        $unwind: { path: "$object", preserveNullAndEmptyArrays: true },
      },
    ];
  });

  typePipelines.push([
    baseMatch,
    { $match: { [refPath]: { $nin: Object.keys(refLookups) } } },
  ]);

  const [first, ...rest] = typePipelines;

  const pipeline = [
    ...first,
    ...rest.map((p) => ({
      $unionWith: {
        coll: model.collection.name,
        pipeline: p,
      },
    })),
    { $sort: sort },
    { $skip: skip },
    ...(limit > 0 ? [{ $limit: limit }] : []),
  ];

  if (select) pipeline.push({ $project: select });

  return model.aggregate(pipeline);
}

async function countDocuments({ model, query = {} }) {
  return model.countDocuments(query);
}

async function getModelCounts({
  model,
  filterQuery = {},
  statusMap = { status: ["active", "inactive"] },
}) {
  const facetStages = {
    total: [
      { $match: { status: { $ne: "deleted" } } },
      { $count: "count" },
    ],
  };

  for (const [field, values] of Object.entries(statusMap)) {
    for (const value of values) {
      facetStages[value] = [
        { $match: { [field]: value } },
        { $count: "count" },
      ];
    }
  }

const [filteredCount, globalCounts] = await Promise.all([
  model.countDocuments(filterQuery),

  model.aggregate([
    {
      $match: {
        "recurringMeta.isTemplate": false,
        status: { $ne: "deleted" }
      }
    },
    { $facet: facetStages },
    {
      $project: {
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        ...Object.values(statusMap)
          .flat()
          .reduce(
            (acc, val) => ({
              ...acc,
              [val]: {
                $ifNull: [{ $arrayElemAt: [`$${val}.count`, 0] }, 0],
              },
            }),
            {}
          ),
      },
    },
  ]),
]);


  const counts = globalCounts[0] || {};
  return {
    totalFiltered: filteredCount || 0,
    total: counts.total || 0,
    ...Object.fromEntries(
      Object.entries(counts).filter(([k]) => k !== "total")
    ),
  };
}

async function findById({ model, id, populate = [] }) {
  let q = model.findById(id);
  populate.forEach((p) => (q = q.populate(p)));
  return q.lean().exec();
}

async function findByIdAndUpdate({ model, id, data, populate = [] }) {
  let q = model.findByIdAndUpdate(id, data, { new: true });
  populate.forEach((p) => (q = q.populate(p)));
  return q.lean().exec();
}

async function deleteOne(doc, soft = false) {
  if (!doc) return null;
  return soft
    ? doc.updateOne({ status: "deleted" })
    : doc.deleteOne();
}

async function updateMany({ model, filter, data }) {
  return model.updateMany(filter, data);
}

async function normalizeOrders({ model, orderField = "order" }) {
  const docs = await model.find({ status: { $ne: "deleted" } }).sort(orderField);
  const ops = docs.map((doc, i) => ({
    updateOne: { filter: { _id: doc._id }, update: { $set: { [orderField]: i + 1 } } },
  }));
  if (ops.length) await model.bulkWrite(ops);
  return true;
}


function buildKeywordQueryFromModels(models, keyword) {
  
  if (!keyword || !keyword.trim()) return {};

  const orConditions = [];

  function getStringPaths(schema, prefix = '') {
    const paths = [];
    schema.eachPath((pathname, schemaType) => {
      if (schemaType.instance === 'String') {
        paths.push(prefix + pathname);
      } else if (schemaType.schema) {
        const nestedPaths = getStringPaths(schemaType.schema, prefix + pathname + '.');
        paths.push(...nestedPaths);
      }
    });
    return paths;
  }
  models.forEach(({ schema, prefix }) => {
    const stringFields = getStringPaths(schema, prefix);
    stringFields.forEach(field => {
      orConditions.push({ [field]: { $regex: keyword, $options: 'i' } });
    });
  });

  return orConditions.length > 0 ? { $or: orConditions } : {};
}


module.exports = {
  createWithAutoOrder,
  getWithFilters,
  countDocuments,
  getModelCounts,
  findById,
  findByIdAndUpdate,
  deleteOne,
  updateMany,
  normalizeOrders,
  buildKeywordQueryFromModels,
};
