const express = require('express');
const router = express.Router();
const Listing = require('../models/listingModel');
const { verifyToken } = require('../middleware/authMiddleware');

// Create listing
router.post('/', verifyToken, async (req, res) => {
  try {
    const listing = new Listing({ ...req.body, owner: req.user.id });
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing' });
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
