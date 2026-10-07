var SibApiV3Sdk = require("sib-api-v3-sdk");


const sendEmailViaBrevo = async (emails, subject, body, config = {}) => {
  console.debug("🚀 ~ sendEmailViaBrevo ~ emails:", emails)
  var defaultClient = SibApiV3Sdk.ApiClient.instance;
  var apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_EMAIL_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = body;
  sendSmtpEmail.sender = { email: "noreply@coachcritic.com", name: "Nous" };

  sendSmtpEmail.to = emails.map(email => ({ email }));
  try {
   const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
   console.debug("🚀 ~ sendEmailViaBrevo ~ data:", data)
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


module.exports = {
  sendEmailViaBrevo,
};
