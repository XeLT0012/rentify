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

  // 📸 Media
  images: [{ type: String }], // store file paths

  // ✅ Trust & Safety
  terms: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
