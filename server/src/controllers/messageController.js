const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { ErrorResponse } = require('../middleware/errorHandler');
const { createNotification } = require('./notificationController');

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user.id] }
    })
    .populate('participants', 'name avatarUrl email role')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  const { receiverId, content } = req.body;

  try {
    // 1. Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId]
      });
    }

    // 2. Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      receiver: receiverId,
      content
    });

    // 3. Update conversation with last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    // Create notification for receiver
    await createNotification({
      recipient: receiverId,
      sender: req.user.id,
      type: 'message',
      content: `sent you a message: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
      link: `/chat/${req.user.id}`
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};
