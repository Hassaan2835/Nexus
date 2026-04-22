const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  try {
    const document = await Document.create({
      name: req.body.name || req.file.originalname,
      owner: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user.id },
        { sharedWith: { $in: [req.user.id] } }
      ]
    }).populate('owner', 'name email');

    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Share document
// @route   PUT /api/documents/:id/share
// @access  Private
exports.shareDocument = async (req, res, next) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    if (document.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to share this document', 401));
    }

    const { userId } = req.body;
    if (!document.sharedWith.includes(userId)) {
      document.sharedWith.push(userId);
      await document.save();
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sign document
// @route   PUT /api/documents/:id/sign
// @access  Private
exports.signDocument = async (req, res, next) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    const isShared = document.sharedWith.includes(req.user.id);
    const isOwner = document.owner.toString() === req.user.id;

    if (!isOwner && !isShared) {
      return next(new ErrorResponse('Not authorized to sign this document', 401));
    }

    const { signatureData } = req.body;
    document.signatures.push({
      user: req.user.id,
      signatureData
    });
    document.isSigned = true;
    
    await document.save();

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    if (document.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this document', 401));
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../public', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
