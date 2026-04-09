const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all entrepreneurs
// @route   GET /api/users/entrepreneurs
// @access  Private
exports.getEntrepreneurs = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'entrepreneur' });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all investors
// @route   GET /api/users/investors
// @access  Private
exports.getInvestors = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'investor' });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    // Prevent password change via this route
    if (req.body.password) {
      delete req.body.password;
    }

    // Only allow updating own profile unless admin (if adding admin role later)
    if (req.params.id !== req.user.id) {
       return next(new ErrorResponse('Not authorized to update this profile', 401));
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
