const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/authMiddleware');
const profileUpload = require('../middleware/profileUploadMiddleware');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
  token,
  user: {
    _id: user._id,
    role: user.role
  }
});


  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile with image
router.put('/profile', verifyToken, profileUpload.single('profileImage'), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio,
      phone: req.body.phone,
      address: req.body.address
    };

    if (req.file) {
      updates.profileImage = `/profile_uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true } // ✅ ensures validation
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('🔥 Profile update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});




module.exports = router;
