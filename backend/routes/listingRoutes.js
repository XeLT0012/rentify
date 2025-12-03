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

// 📌 Admin: Get all listings (any status)
router.get('/all', async (req, res) => {
  try {
    const listings = await Listing.find().populate('owner', 'name email');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all listings' });
  }
});

// 📌 Approve listing
router.put('/:id/approve', async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved' },   // ✅ use the same field as reject
      { new: true, runValidators: true }
    ).populate('owner', 'name email');  // ✅ keep owner populated

    if (!updatedListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing approved successfully', listing: updatedListing });
  } catch (err) {
    console.error('Failed to approve listing:', err);
    res.status(500).json({ error: 'Failed to approve listing' });
  }
});


// 📌 Reject listing
router.put('/:id/reject', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected' },
      { new: true }
    );
    res.json({ message: 'Listing rejected successfully', listing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject listing' });
  }
});

// 📌 Edit listing (admin can update details except category)
router.put('/:id/edit', async (req, res) => {
  try {
    const { title, location, condition, price, image } = req.body;

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(location && { location }),
        ...(condition && { condition }),
        ...(price && { price }),
        ...(image && { image })
      },
      { new: true, runValidators: true } // ✅ return updated doc & enforce schema validation
    ).populate('owner', 'name email'); // ✅ ensure owner details are returned

    if (!updatedListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing updated successfully', listing: updatedListing });
  } catch (err) {
    console.error('Failed to update listing:', err);
    res.status(500).json({ error: 'Failed to update listing' });
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

// 📌 Toggle featured status (admin can mark/unmark listing as featured)
router.put('/:id/featured', async (req, res) => {
  try {
    const { featured } = req.body; // expects true/false

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { featured },
      { new: true, runValidators: true }
    ).populate('owner', 'name email'); // ✅ keep owner populated

    if (!updatedListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Featured status updated', listing: updatedListing });
  } catch (err) {
    console.error('Failed to update featured status:', err);
    res.status(500).json({ error: 'Failed to update featured status' });
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
