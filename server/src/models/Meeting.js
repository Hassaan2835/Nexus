const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: String,
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  meetingLink: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create meeting link before save
MeetingSchema.pre('save', function(next) {
  if (!this.meetingLink) {
    this.meetingLink = Math.random().toString(36).substring(2, 12);
  }
  next();
});

module.exports = mongoose.model('Meeting', MeetingSchema);
