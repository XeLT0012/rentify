const express = require('express');
const router = express.Router();
const Listing = require('../models/listingModel');
const { verifyToken } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');
const Booking = require('../models/Booking');  // ✅ Import Booking model

// Create new listing
router.post('/', verifyToken, imageUpload.array('images', 5), async (req, res) => {
  try {
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const listing = new Listing({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      condition: req.body.condition,
      price: req.body.price,
      availableFrom: req.body.availableFrom,
      availableUntil: req.body.availableUntil,
      deliveryOption: req.body.deliveryOption,
      location: req.body.location,
      owner: req.user.id,
      contactPreference: req.body.contactPreference,
      images,
      terms: req.body.terms
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    console.error('🔥 Listing creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create listing' });
  }
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().populate('owner', 'name email');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get listings created by logged-in user
router.get('/my-listings', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const listings = await Listing.find({
      owner: req.user.id,
      $or: [
        { availableUntil: { $gte: now } },
        { availableUntil: null } // if no expiry set
      ]
    })
    .populate('owner', 'name email phone');

    res.json(listings);
  } catch (err) {
    console.error('🔥 Error fetching user listings:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name email');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Update listing
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id }, // ensure only owner can edit
      req.body,
      { new: true } // return updated document
    );

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or not owned by user' });
    }

    res.json(listing);
  } catch (err) {
    console.error('🔥 Listing update error:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing (only if no active bookings exist)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or not owned by user' });
    }

    // ✅ Check for active bookings
    const activeBookings = await Booking.find({
      listing: listing._id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete listing with active bookings' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('🔥 Listing delete error:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
