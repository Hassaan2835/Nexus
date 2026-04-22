const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Deposit funds (Simulation)
// @route   POST /api/payments/deposit
// @access  Private
exports.depositFunds = async (req, res, next) => {
  const { amount, description } = req.body;

  try {
    const user = await User.findById(req.user.id);
    user.walletBalance += amount;
    await user.save();

    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount,
      description: description || 'Deposit to wallet',
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      balance: user.walletBalance,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user balance & transactions
// @route   GET /api/payments/wallet
// @access  Private
exports.getWalletInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      balance: user.walletBalance,
      transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Transfer funds / Investment
// @route   POST /api/payments/transfer
// @access  Private
exports.transferFunds = async (req, res, next) => {
  const { amount, recipientId, description, type } = req.body;

  try {
    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return next(new ErrorResponse('Recipient not found', 404));
    }

    if (sender.walletBalance < amount) {
      return next(new ErrorResponse('Insufficient funds', 400));
    }

    // Deduct from sender
    sender.walletBalance -= amount;
    await sender.save();

    // Add to recipient
    recipient.walletBalance += amount;
    await recipient.save();

    // Create transaction for sender
    const transaction = await Transaction.create({
      user: req.user.id,
      type: type || 'transfer',
      amount,
      recipient: recipientId,
      description: description || `Transfer to ${recipient.name}`,
      status: 'completed'
    });

    // Create transaction record for recipient
    await Transaction.create({
      user: recipientId,
      type: 'deposit',
      amount,
      description: `Received from ${sender.name}`,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      balance: sender.walletBalance,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};
