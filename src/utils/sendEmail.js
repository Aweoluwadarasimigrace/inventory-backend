const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    const info = nodemailer.createTransport({
      host:"smtp-relay.brevo.com",
      port:587,
     secure:false,
      auth: {
        user: process.env.SMPT_USER,
        pass: process.env.SMPT_PASS,
      },
    });

    const option = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: html,
    };

    console.log("Sending email to:", email);
console.log("From:", process.env.EMAIL);
console.log("Subject:", subject);

    await info.sendMail(option);
    console.log(email, "sent successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
