const CollaborationRequest = require('../models/CollaborationRequest');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Create collaboration request
// @route   POST /api/collaboration/request
// @access  Private (Investor only)
exports.createRequest = async (req, res, next) => {
  const { entrepreneurId, message } = req.body;

  try {
    // Check if request already exists
    const existing = await CollaborationRequest.findOne({
      investor: req.user.id,
      entrepreneur: entrepreneurId,
      status: 'pending'
    });

    if (existing) {
      return next(new ErrorResponse('A pending request already exists for this entrepreneur', 400));
    }

    const request = await CollaborationRequest.create({
      investor: req.user.id,
      entrepreneur: entrepreneurId,
      message
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get requests for current user
// @route   GET /api/collaboration/requests
// @access  Private
exports.getRequests = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'entrepreneur') {
      query = { entrepreneur: req.user.id };
    } else {
      query = { investor: req.user.id };
    }

    const requests = await CollaborationRequest.find(query)
      .populate('investor', 'name email avatarUrl role')
      .populate('entrepreneur', 'name email avatarUrl role startupName industry')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update request status
// @route   PUT /api/collaboration/requests/:id
// @access  Private (Entrepreneur only to accept/reject)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    let request = await CollaborationRequest.findById(req.params.id);

    if (!request) {
      return next(new ErrorResponse('Request not found', 404));
    }

    // Only entrepreneur can change status
    if (request.entrepreneur.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this request', 401));
    }

    request = await CollaborationRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    next(err);
  }
};
