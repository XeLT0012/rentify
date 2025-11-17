const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/authMiddleware');

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { listing, startDate, endDate, notes, totalPrice } = req.body;

    const booking = new Booking({
      listing,
      renter: req.user.id,
      startDate,
      endDate,
      notes,
      totalPrice
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create booking' });
  }
});

// Get all bookings for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate({
        path: 'listing',
        select: 'title images price location contactPreference owner',
        populate: {
          path: 'owner',
          select: 'name email phone'
        }
      });

    res.json(bookings);
  } catch (err) {
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
    console.error('🔥 Booking update error:', err); // ✅ log actual error
    res.status(500).json({ error: 'Failed to update booking status', details: err.message });
  }
});


module.exports = router;
