const { v2: cloudinary } = require("cloudinary");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );

let configured = false;

const getCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error("cloudinary_not_configured");
  }

  if (!configured) {
    if (!process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
    cloudinary.config({ secure: true });
    configured = true;
  }

  return cloudinary;
};

const getUploadFolder = () => process.env.CLOUDINARY_UPLOAD_FOLDER || "";

module.exports = {
  getCloudinary,
  isCloudinaryConfigured,
  getUploadFolder,
};
