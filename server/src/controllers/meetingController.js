const Meeting = require('../models/Meeting');
const { ErrorResponse } = require('../middleware/errorHandler');
const { createNotification } = require('./notificationController');

// @desc    Create meeting
// @route   POST /api/meetings
// @access  Private
exports.createMeeting = async (req, res, next) => {
  const { title, description, participants, date, startTime, endTime } = req.body;

  try {
    // Check for conflicts
    const conflicts = await Meeting.find({
      date: new Date(date),
      $or: [
        { organizer: req.user.id },
        { participants: { $in: [req.user.id, ...participants] } }
      ],
      status: { $ne: 'cancelled' },
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        }
      ]
    });

    if (conflicts.length > 0) {
      return next(new ErrorResponse('Time slot conflict detected for organizer or participants', 400));
    }

    const meeting = await Meeting.create({
      title,
      description,
      organizer: req.user.id,
      participants,
      date: new Date(date),
      startTime,
      endTime
    });

    // Create notifications for all participants
    for (const participantId of participants) {
      await createNotification({
        recipient: participantId,
        sender: req.user.id,
        type: 'meeting',
        content: `scheduled a new meeting: "${title}"`,
        link: '/meetings'
      });
    }

    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user meetings
// @route   GET /api/meetings
// @access  Private
exports.getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user.id },
        { participants: { $in: [req.user.id] } }
      ]
    }).populate('organizer', 'name email avatarUrl').populate('participants', 'name email avatarUrl');

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private
exports.getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('organizer', 'name email avatarUrl')
      .populate('participants', 'name email avatarUrl');

    if (!meeting) {
      return next(new ErrorResponse(`Meeting not found with id of ${req.params.id}`, 404));
    }

    // Check if user is organizer or participant
    const isParticipant = meeting.participants.some(p => p._id.toString() === req.user.id);
    if (meeting.organizer._id.toString() !== req.user.id && !isParticipant) {
      return next(new ErrorResponse('Not authorized to access this meeting', 401));
    }

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update meeting status
// @route   PUT /api/meetings/:id/status
// @access  Private
exports.updateMeetingStatus = async (req, res, next) => {
  try {
    let meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return next(new ErrorResponse(`Meeting not found with id of ${req.params.id}`, 404));
    }

    // Only participants can accept/reject
    // Organizer can cancel
    if (req.body.status === 'cancelled') {
        if (meeting.organizer.toString() !== req.user.id) {
            return next(new ErrorResponse('Only organizer can cancel the meeting', 401));
        }
    } else {
        const isParticipant = meeting.participants.some(p => p.toString() === req.user.id);
        if (!isParticipant) {
            return next(new ErrorResponse('Only participants can update status', 401));
        }
    }

    meeting = await Meeting.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
exports.deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return next(new ErrorResponse(`Meeting not found with id of ${req.params.id}`, 404));
    }

    if (meeting.organizer.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this meeting', 401));
    }

    await meeting.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
