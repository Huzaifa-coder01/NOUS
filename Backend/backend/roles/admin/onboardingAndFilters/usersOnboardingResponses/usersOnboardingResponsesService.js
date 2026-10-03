const usersOnboardingResponsesRepo = require("./usersOnboardingResponsesRepository");
const {
  formatOnboardingResponses,
  formatOnboardingResponse,
} = require("./formatter/formatOnboardingResponses");
const { User } = require("@UsersModel");

const getUsersOnboardingResponses = async (filter = {}) => {
  const responses = await usersOnboardingResponsesRepo.getUsersOnboardingResponses(filter);
  return {
    responses: formatOnboardingResponses(responses),
  };
};

const getUsersOnboardingResponseById = async (id) => {
  const response = await usersOnboardingResponsesRepo.findUsersOnboardingResponseById(id);
  return formatOnboardingResponse(response);
};


const upsertUsersOnboardingResponseByUser = async (userId, data) => {
  let existing = await usersOnboardingResponsesRepo.findUsersOnboardingResponseByUser(userId);
  if (data.name) {
    await User.findByIdAndUpdate(userId, { name: data.name });
  }
  if (existing) {
    data.isOnboardingCompleted = true;
    let updatedResponse = await usersOnboardingResponsesRepo.updateUsersOnboardingResponseByUser(userId, data);
    return formatOnboardingResponse(updatedResponse);
  } else {
    data.isOnboardingCompleted = true;
    let newResponse = await usersOnboardingResponsesRepo.createUsersOnboardingResponse(data);
    return formatOnboardingResponse(newResponse);
  }
};

const deleteUsersOnboardingResponse = async (id) => {
  return usersOnboardingResponsesRepo.deleteUsersOnboardingResponseById(id);
};

module.exports = {
  getUsersOnboardingResponses,
  getUsersOnboardingResponseById,
  upsertUsersOnboardingResponseByUser,
  deleteUsersOnboardingResponse,
};
