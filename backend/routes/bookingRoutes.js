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
    const bookings = await Booking.find({ renter: req.user.id }).populate('listing');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
