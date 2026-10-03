const ContactUs = require("../models/ContactUs");
const {
  sendResponse,
  validateParams,
  parsePaginationParams,
  generateMeta,
} = require("../helperUtils/responseUtil");
const validator = require("validator");
const { sendEmailViaBrevo } = require("../helperUtils/emailUtil");
const { config } = require("dotenv");
const { validatePhoneNumber } = require("../helperUtils/validationsUtil");

const createContactRequest = async (req, res) => {
  const { name, subject, message } = req.body;

  const validationOptions = {
    rawData: ["name", "subject", "message"],
  };

  if (!validateParams(req, res, validationOptions)) {
    return;
  }


  try {
    const contactRequest = new ContactUs({
      name,
      subject,
      message,
      status: "pending",
    });

    const emailSubject = "Contact Us Request by " + name;
    const emailMessage = `Name: ${name} \n Subject: ${subject} \n Message: ${message}`;

    const supportEmail = process.env.SUPPORT_EMAIL;

    await Promise.all([
      contactRequest.save(),
    ]);

    return sendResponse({
      res,
      statusCode: 201,
      translationKey: "contact_request",
    });
  } catch (error) {

    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: errorMessages[0],
        error: error,
      });
    }

    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "internal_server",
      error: error,
    });
  }
};


module.exports = {
  createContactRequest,
};
