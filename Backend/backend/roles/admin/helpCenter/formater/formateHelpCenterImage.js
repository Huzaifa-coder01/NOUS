const { getFullImageUrl } = require("../../../../helperUtils/imageHelper");

function formatFavoritesOrganization(item) {
  let org = item;
  if (!org) return null;

  delete org.__v;

  if (org.image) {
    const imageName = org.image;
    org.image = getFullImageUrl(imageName);
  }

  return org; 
}

module.exports = {
  formatFavoritesOrganization,
};