const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // 📝 Essential Item Details
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Electronics', 'Furniture', 'Vehicles', 'Tools', 'Others'] 
  },
  description: { type: String },
  condition: { 
    type: String, 
    enum: ['New', 'Like New', 'Good', 'Fair'], 
    required: true 
  },

  // 💰 Rental Information
  price: { type: Number, required: true },
  availableFrom: { type: Date },
  availableUntil: { type: Date },

  // 📍 Location & Logistics
  deliveryOption: { 
    type: String, 
    enum: ['pickup', 'delivery', 'negotiable'], 
    required: true 
  },
  location: { type: String, required: true },

  // 👤 Owner Information
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactPreference: { 
    type: String, 
    enum: ['chat', 'phone', 'email'], 
    required: true 
  },

  // Vendor-specific details (optional, only if role === 'vendor')
  shopLocation: { type: String },
  experience: { type: String },
  certifications: { type: String },

  // 📸 Media
  images: [{ type: String }],

  // ✅ Trust & Safety
  terms: { type: String },

  featured: { type: Boolean, default: false },

  // 🔒 Admin Approval
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
