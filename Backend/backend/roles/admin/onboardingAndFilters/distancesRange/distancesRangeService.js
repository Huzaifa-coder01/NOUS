const distancesRangeRepo = require("./distancesRangeRepository");

const getDistanceRanges = async (filter = {}) => {
  const distanceRanges = await distancesRangeRepo.getDistanceRanges(filter);
  
  const nonNumeric = [];
  const numeric = [];
  
  distanceRanges.forEach((item) => {
    if (/^\d+$/.test(item.title)) {
      numeric.push(item);
    } else {
      nonNumeric.push(item);
    }
  });
  
  numeric.sort((a, b) => parseInt(a.title) - parseInt(b.title));
  
  const sorted = [...nonNumeric, ...numeric];
  
  return {
    distanceRanges: sorted,
  };
};

const getDistanceRangeById = async (id) => {
  return distancesRangeRepo.findDistanceRangeById(id);
};

const createDistanceRange = async ({ title, status }) => {
  return distancesRangeRepo.createDistanceRange({
    title,
    status,
  });
};

const updateDistanceRange = async (id, { title, status }) => {
  return distancesRangeRepo.updateDistanceRangeById(id, { title, status });
};

const deleteDistanceRange = async (id) => {
  return distancesRangeRepo.deleteDistanceRangeById(id);
};

module.exports = {
  getDistanceRanges,
  getDistanceRangeById,
  createDistanceRange,
  updateDistanceRange,
  deleteDistanceRange,
};
