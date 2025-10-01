const SibApiV3Sdk = require("sib-api-v3-sdk");


const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendemail = async (email, subject, html) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();   
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.EMAIL };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.html = html;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendemail;
