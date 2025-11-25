const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/authMiddleware');
const profileUpload = require('../middleware/profileUploadMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('🔥 Profile update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// Temporary in-memory store (not persisted)
let resetCodes = {};

// Forgot Password - generate numeric code
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ✅ Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Store temporarily in memory (expires in 10 minutes)
    resetCodes[email] = { code: resetCode, expires: Date.now() + 10 * 60 * 1000 };

    // ✅ Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Rentify Password Reset Code',
      html: `
        <h2>Password Reset Code</h2>
        <p>Your reset code is: <b>${resetCode}</b></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });

    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    console.error('🔥 Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Verify code and reset password
router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;
  try {
    const entry = resetCodes[email];
    if (!entry) return res.status(400).json({ error: 'No reset request found' });
    if (entry.expires < Date.now()) return res.status(400).json({ error: 'Code expired' });
    if (entry.code !== code) return res.status(400).json({ error: 'Invalid code' });

    // ✅ Update password
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    // ✅ Clear code after use
    delete resetCodes[email];

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('🔥 Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
