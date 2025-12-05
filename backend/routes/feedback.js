const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedbackModel');
const { verifyToken } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/feedbackUpload');

// 📌 POST: Submit feedback with optional screenshot
router.post('/', verifyToken, upload.single('screenshot'), async (req, res) => {
  try {
    const { message, category, rating } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Feedback message is required' });
    }

    const feedback = new Feedback({
      user: req.user.id,
      message,
      category,
      rating,
      screenshot: req.file ? '/feedback_uploads/' + req.file.filename : null
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    console.error('Failed to submit feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// 📌 GET: User’s own feedback history
router.get('/my-feedback', verifyToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error('Failed to fetch user feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;
