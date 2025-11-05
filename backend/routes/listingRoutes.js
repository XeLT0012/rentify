const express = require('express');
const router = express.Router();
const Listing = require('../models/listingModel');

// GET featured listings
router.get('/featured', async (req, res) => {
  try {
    const featured = await Listing.find({ isFeatured: true }).limit(6);
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured listings' });
  }
});

module.exports = router;