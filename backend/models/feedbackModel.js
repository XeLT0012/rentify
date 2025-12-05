const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who posted
  message: { type: String, required: true }, // feedback text
  category: { 
    type: String, 
    enum: ['Bug Report', 'Feature Request', 'General Feedback'], 
    default: 'General Feedback' 
  },
  rating: {
  type: Number,
  min: 1,
  max: 5,
  default: null, // explicitly allow "no rating"
  validate: {
    validator: Number.isInteger,
    message: '{VALUE} is not an integer value'
  }
},

screenshot: {
  type: String,
  default: null, // no screenshot by default
  trim: true // clean up accidental spaces in path
},
  status: { 
    type: String, 
    enum: ['new', 'reviewed', 'resolved'], 
    default: 'new' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
