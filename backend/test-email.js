require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: `"Rentify" <${process.env.EMAIL_USER}>`,
  to: 'chkrbrtysumit0012@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email from Rentify backend.'
}, (err, info) => {
  if (err) return console.error("🔥 Email error:", err);
  console.log("📩 Email sent:", info.response);
});
