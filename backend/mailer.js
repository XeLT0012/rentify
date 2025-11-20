const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendBookingConfirmation(to, booking) {
  const mailOptions = {
    from: `"Rentify" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Booking Confirmation - ${booking.listing.title}`,
    html: `
      <h2>Booking Confirmation</h2>
      <p>Dear ${booking.renter?.name},</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      <ul>
        <li><strong>Listing:</strong> ${booking.listing.title}</li>
        <li><strong>Location:</strong> ${booking.listing.location}</li>
        <li><strong>Dates:</strong> ${booking.startDate.toDateString()} → ${booking.endDate.toDateString()}</li>
        <li><strong>Total Price:</strong> ₹${booking.totalPrice}</li>
        <li><strong>Payment ID:</strong> ${booking.paymentId}</li>
      </ul>
      <p>Agent Details:</p>
      <ul>
        <li><strong>Name:</strong> ${booking.listing.owner?.name}</li>
        <li><strong>Email:</strong> ${booking.listing.owner?.email}</li>
        <li><strong>Phone:</strong> ${booking.listing.owner?.phone}</li>
      </ul>
      <p>Thank you for using Rentify!</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Email sent:", info.response);
  } catch (err) {
    console.error("🔥 Email send error:", err);
  }
}

module.exports = { sendBookingConfirmation };
