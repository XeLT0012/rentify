const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/authMiddleware');

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { listing, startDate, endDate, notes, totalPrice, paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID required' });
    }

    const booking = new Booking({
      listing,
      renter: req.user.id,
      startDate,
      endDate,
      notes,
      totalPrice,
      status: 'pending',   // stays pending until agent confirms
      paymentId
    });

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error('🔥 Booking creation error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get bookings for logged-in renter (My Bookings)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate({
        path: 'listing',
        select: 'title price images location contactPreference owner',
        populate: {
          path: 'owner',
          select: 'name email phone'
        }
      })
      .populate('renter', 'name email');

    res.json(bookings);
  } catch (err) {
    console.error('🔥 Error fetching my bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get bookings for a specific listing (owner only)
router.get('/listing/:listingId', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ listing: req.params.listingId })
      .populate('renter', 'name email phone'); // renter details
    res.json(bookings);
  } catch (err) {
    console.error('🔥 Error fetching bookings for listing:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Agent updates booking status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id).populate('listing');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.listing || booking.listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (err) {
    console.error('🔥 Booking update error:', err);
    res.status(500).json({ error: 'Failed to update booking status', details: err.message });
  }
});

// Mark booking as paid
const { sendBookingConfirmation } = require('../mailer');
const { sendVendorEmail } = require('../mailer');

router.put('/:id/paid', verifyToken, async (req, res) => {
  console.log("📩 /paid route triggered");
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID required' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate({
  path: 'listing',
  select: 'title category condition location availableFrom availableTo', // ✅ include booking dates
  populate: { path: 'owner', select: 'name email phone' }
})
      .populate('renter', 'name email phone');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.paymentId = paymentId;
    await booking.save();

    // ✅ Only call sendBookingConfirmation once
    await sendBookingConfirmation(booking.renter.email, booking);
    await sendVendorEmail(booking);

    res.json({ message: 'Booking marked as paid & email sent', booking });
  } catch (err) {
    console.error("🔥 Error in /paid route:", err);
    res.status(500).json({ error: 'Failed to mark booking as paid' });
  }
});


module.exports = router;
