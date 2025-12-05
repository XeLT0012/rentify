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

// 📌 GET: All feedback (admin only)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error('Failed to fetch all feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// 📌 PUT: Change feedback status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'reviewed', 'resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedback.status = status;
    await feedback.save();

    res.json({ message: 'Feedback status updated successfully', feedback });
  } catch (err) {
    console.error('Failed to update feedback status:', err);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

module.exports = router;
