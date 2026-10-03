const QRCode = require("qrcode");

const generateQRCode = async (payload) => {
  if (!payload) {
    throw new Error("qr_payload_required");
  }

  const encoded = Buffer
    .from(JSON.stringify(payload))
    .toString("base64");

  return QRCode.toDataURL(encoded);
};

module.exports = { generateQRCode };