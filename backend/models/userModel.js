const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  blocked: { type: Boolean, default: false },

  // 🔥 New optional profile fields
  profileImage: { type: String }, // stored as `/profile_uploads/<filename>`
  bio: { type: String },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
