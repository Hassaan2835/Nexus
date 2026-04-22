const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a document name']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: String,
  fileSize: Number,
  sharedWith: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  isSigned: {
    type: Boolean,
    default: false
  },
  signatures: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      signedAt: {
        type: Date,
        default: Date.now
      },
      signatureData: String // base64 representation or path
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
