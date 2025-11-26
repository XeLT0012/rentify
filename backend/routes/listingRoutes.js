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

    const {
      title,
      category,
      description,
      condition,
      price,
      availableFrom,
      availableUntil,
      deliveryOption,
      location,
      contactPreference,
      terms,
      userType,
      shopLocation,
      experience,
      certifications
    } = req.body;

    const listingData = {
      title,
      category,
      description,
      condition,
      price,
      availableFrom,
      availableUntil,
      deliveryOption,
      location,
      owner: req.user.id,
      contactPreference,
      images,
      terms,
      approvalStatus: 'pending', // ✅ default to pending
      userType
    };

    // ✅ Add vendor-specific fields only if userType is vendor
    if (userType === 'vendor') {
      listingData.shopLocation = shopLocation;
      listingData.experience = experience;
      listingData.certifications = certifications;
    }

    const listing = new Listing(listingData);
    await listing.save();

    res.status(201).json(listing);
  } catch (err) {
    console.error('🔥 Listing creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create listing' });
  }
});

// Get all listings (only approved for public)
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({ approvalStatus: 'approved' })
      .populate('owner', 'name email');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get listings created by logged-in user (show all, even pending/rejected)
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

// Admin approval route
router.put('/:id/approve', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { status } = req.body; // expected: 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid approval status' });
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: `Listing ${status}`, listing });
  } catch (err) {
    console.error('🔥 Error updating approval status:', err);
    res.status(500).json({ error: 'Failed to update approval status' });
  }
});


// Get featured listings for home page
router.get('/featured', async (req, res) => {
  try {
    const listings = await Listing.find({ featured: true })
      .populate('owner', 'name email');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured listings' });
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

// Mark listing as featured (admin only)
router.put('/:id/featured', verifyToken, async (req, res) => {
  try {
    // ✅ Ensure only admin can update
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { featured: true },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing marked as featured', listing });
  } catch (err) {
    console.error('🔥 Error marking listing as featured:', err);
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
