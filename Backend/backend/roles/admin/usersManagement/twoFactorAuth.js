const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const generate2FASecret = (appName, userIdentifier) => {
  const secret = speakeasy.generateSecret({
    length: 32,
    name: `${appName} (${userIdentifier})`,
    issuer: appName,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
};

const generateQRCode = async (otpauthUrl) => {
  return qrcode.toDataURL(otpauthUrl);
};

const verify2FAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
};

module.exports = {
  generate2FASecret,
  generateQRCode,
  verify2FAToken,
};
