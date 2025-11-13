const express = require('express');
const router = express.Router();
const Listing = require('../models/listingModel');
const { verifyToken } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');

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
      priceUnit: req.body.priceUnit,
      securityDeposit: req.body.securityDeposit,
      availableFrom: req.body.availableFrom,
      availableUntil: req.body.availableUntil,
      minDuration: req.body.minDuration,
      maxDuration: req.body.maxDuration,
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

module.exports = router;
