const { User } = require("@UsersModel");

const createUser = async (data) => {
  const user = new User(data);
  return await user.save();
};

const getUsersWithFilters = async (query, skip, limit) => {
  const users = await User.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    ...(limit > 0 ? [{ $limit: limit }] : []),
  ]);

  return users;
};


const countUsers = async (query = {}) => {
  return User.countDocuments(query);
};

const findUserById = async (id, projection = null) => {
  const proj = projection ? projection : {};

  return User.findById(id, proj);
};

const getUserDetailsForQRRepo = async (id) => {
  return User.findById(id).select("profileIcon name email phoneNumber");
}

const updateUserData = async (user, data) => {
  Object.assign(user, data);
  return await user.save();
};

const deleteUserById = async (user) => {
  return await user.deleteOne();
};

const findByIdAndUpdate = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true });
};

const updateTwoFA = async (userId, data) => {
  return User.findByIdAndUpdate(
    userId,
    { $set: data },
    {
      new: true,
      runValidators: true,
    }
  );
};


module.exports = {
  createUser,
  getUsersWithFilters,
  countUsers,
  findUserById,
  updateUserData,
  deleteUserById,
  findByIdAndUpdate,
  updateTwoFA,
  getUserDetailsForQRRepo
};
