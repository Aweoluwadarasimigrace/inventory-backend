const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");


const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sendEmails = async (email, subject, html) => {

  const emailParams = new EmailParams()
    .setFrom(new Sender(process.env.SENDER_EMAIL, "My App"))
    .addTo(new Recipient(email))
    .setSubject(subject)
    .setHtml(html);

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmails;