const Resend = require("resend")

const resend = new Resend(process.env.RESEND_API_KEY);



const sendEmails = async (email, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "<YOUR_EMAIL>",
      to: email,
      subject: subject,
      html: html
    });
    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmails;
