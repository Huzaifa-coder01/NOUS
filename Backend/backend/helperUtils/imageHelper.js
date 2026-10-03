function getFileName(value) {
  if (!value || typeof value !== "string") return "";

  if (!value.startsWith("http")) return value;

  // A row written before this rule may hold a full url. Peel off the origin and
  // any delivery prefix, keeping the folder structure of the stored name.
  let path = value.split("?")[0].replace(/^https?:\/\/[^/]+\//, "");

  const afterUpload = path.split("/upload/")[1];
  if (afterUpload !== undefined) path = afterUpload;

  return path.replace(/^v\d+\//, "");
}

const getFullImageUrl = getFileName;

module.exports = { getFileName, getFullImageUrl };
