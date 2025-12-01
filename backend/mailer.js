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

async function sendVendorEmail(booking) {
  
  const vendorEmail = booking.listing.owner.email;

  const mailOptions = {
    from: '"Rentify" <no-reply@rentify.com>',
    to: vendorEmail,
    subject: `📦 New Booking for ${booking.listing.title}`,
    html: `
      <h2>New Booking Confirmation</h2>
      <p>A renter has successfully booked your product. Here are the details:</p>

      <h3>📌 Product Details</h3>
      <ul>
        <li><strong>Title:</strong> ${booking.listing.title}</li>
        <li><strong>Category:</strong> ${booking.listing.category}</li>
        <li><strong>Condition:</strong> ${booking.listing.condition}</li>
        <li><strong>Location:</strong> ${booking.listing.location}</li>
        <li><strong>Price:</strong> ₹${booking.totalPrice}/day</li>
        <li><strong>Booking Dates:</strong> 
  ${new Date(booking.startDate).toLocaleDateString()} → 
  ${new Date(booking.endDate).toLocaleDateString()}
</li>
      </ul>

      <h3>👤 Renter Details</h3>
      <ul>
        <li><strong>Name:</strong> ${booking.renter.name}</li>
        <li><strong>Email:</strong> ${booking.renter.email}</li>
        <li><strong>Phone:</strong> ${booking.renter.phone || 'Not provided'}</li>
      </ul>

      <h3>📑 Booking Metadata</h3>
      <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Payment ID:</strong> ${booking.paymentId}</li>
        <li><strong>Paid On:</strong> ${new Date().toLocaleString()}</li>
      </ul>

      <p style="margin-top:20px;">Please contact the renter to arrange delivery or pickup.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ Vendor email sent with booking details:", {
    vendor: vendorEmail,
    renter: booking.renter,
    product: booking.listing.title,
    paymentId: booking.paymentId
  });
  console.log("✅ Booking fetched:", booking);
  console.log("📅 Booking dates:", booking.startDate, "→", booking.endDate);
}


module.exports = { sendBookingConfirmation, sendVendorEmail };
