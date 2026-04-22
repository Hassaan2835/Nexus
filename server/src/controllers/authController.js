const crypto = require('crypto');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check for 2FA
    if (user.isTwoFactorEnabled) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      user.twoFactorCode = crypto.createHash('sha256').update(otp).digest('hex');
      user.twoFactorCodeExpire = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();

      // Mock sending SMS/Email
      console.log('--- 2FA OTP MOCK ---');
      console.log(`To: ${user.email}`);
      console.log(`Your OTP is: ${otp}`);
      console.log('--------------------');

      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        email: user.email
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie (if using cookies)
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    // In a real app, send email here. For now, log to console
    console.log('--- PASSWORD RESET EMAIL MOCK ---');
    console.log(`To: ${user.email}`);
    console.log(message);
    console.log('---------------------------------');

    res.status(200).json({
      success: true,
      data: 'Email sent'
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Toggle Two-Factor Authentication
// @route   PUT /api/auth/toggle2fa
// @access  Private
exports.toggleTwoFactor = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
  await user.save();

  res.status(200).json({
    success: true,
    data: { isTwoFactorEnabled: user.isTwoFactorEnabled }
  });
};

// @desc    Verify Two-Factor OTP
// @route   POST /api/auth/verify2fa
// @access  Public
exports.verifyTwoFactor = async (req, res, next) => {
  const { email, code } = req.body;

  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  const user = await User.findOne({
    email,
    twoFactorCode: hashedCode,
    twoFactorCodeExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  user.twoFactorCode = undefined;
  user.twoFactorCodeExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Update user profile details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio,
    avatarUrl: req.body.avatarUrl
  };

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
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

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  });
};
