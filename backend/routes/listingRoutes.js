const express = require('express');
const router = express.Router();
const Listing = require('../models/listingModel');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Create listing
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Incoming listing data:', req.body);
    console.log('Uploaded file:', req.file);

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    if (!req.body.title || !req.body.price || !req.body.category) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const listing = new Listing({
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      isFeatured: req.body.isFeatured === 'true',
      imageUrl: `/uploads/${req.file.filename}`,
      owner: req.user.id
    });

    console.log('🧪 Listing to be saved:', {
  title: req.body.title,
  price: parseFloat(req.body.price),
  category: req.body.category,
  imageUrl: `/uploads/${req.file.filename}`,
  owner: req.user.id
});


    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    console.error('🔥 FULL ERROR:', err);
    res.status(500).json({
      error: err.message || 'Unknown server error',
      name: err.name,
      stack: err.stack,
      details: err.errors || null
    });
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
