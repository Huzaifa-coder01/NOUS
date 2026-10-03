const { getFullImageUrl } = require("../../../../helperUtils/imageHelper");

function formatUpdate(Update) {
  if (!Update) return null;

  const cat = Update.toObject ? Update.toObject() : { ...Update };

    cat.user.profileIcon = getFullImageUrl(cat.user.profileIcon || "noimage.png");
  return {
    ...cat,
    user: {
      ...cat.user,
      profileIcon: cat.user.profileIcon
    },
  };
}


module.exports = { formatUpdate };