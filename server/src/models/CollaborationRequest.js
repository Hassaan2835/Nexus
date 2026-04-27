const mongoose = require('mongoose');

const CollaborationRequestSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  entrepreneur: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CollaborationRequest', CollaborationRequestSchema);
