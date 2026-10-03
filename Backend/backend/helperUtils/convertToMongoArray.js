const mongoose = require('mongoose');

const convertToMongoArray = async (idsString) => {

  const idsArray = idsString.split(/,|\%/).map(id => id.trim());

  return idsArray.map(id => new mongoose.Types.ObjectId(id));
};

module.exports = convertToMongoArray;