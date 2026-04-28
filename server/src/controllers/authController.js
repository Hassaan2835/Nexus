const crypto = require('crypto');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const sendEmail = require('../utils/sendEmail');

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
      // ALWAYS use fixed OTP for project demo
      const otp = '123456';
      
      user.twoFactorCode = crypto.createHash('sha256').update(otp).digest('hex');
      user.twoFactorCodeExpire = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();

      // Send 2FA Email
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Login Verification Code',
          message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #4f46e5;">Verification Required</h2>
              <p>Hello ${user.name},</p>
              <p>You are attempting to log in to Business Nexus. Please use the following code to verify your identity:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #111827;">${otp}</div>
              <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `
        });
      } catch (err) {
        console.error('Email failed to send', err);
        // We don't want to block login if email fails, but in production we might.
        // For now, let's log the OTP so development can continue even if SMTP is not configured.
        console.log(`To: ${user.email} | OTP: ${otp}`);
      }

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
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        startupName: user.startupName,
        industry: user.industry,
        location: user.location,
        foundedYear: user.foundedYear,
        teamSize: user.teamSize,
        fundingNeeded: user.fundingNeeded,
        pitchSummary: user.pitchSummary,
        investmentStage: user.investmentStage,
        investmentInterests: user.investmentInterests,
        minimumInvestment: user.minimumInvestment,
        maximumInvestment: user.maximumInvestment,
        totalInvestments: user.totalInvestments,
        portfolioCompanies: user.portfolioCompanies,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        walletBalance: user.walletBalance
      }
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

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>You are receiving this email because a password reset was requested for your account.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    });

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
    avatarUrl: req.body.avatarUrl,
    // Entrepreneur fields
    startupName: req.body.startupName,
    industry: req.body.industry,
    location: req.body.location,
    foundedYear: req.body.foundedYear,
    teamSize: req.body.teamSize,
    fundingNeeded: req.body.fundingNeeded,
    pitchSummary: req.body.pitchSummary,
    // Investor fields
    investmentStage: req.body.investmentStage,
    investmentInterests: req.body.investmentInterests,
    minimumInvestment: req.body.minimumInvestment,
    maximumInvestment: req.body.maximumInvestment,
    totalInvestments: req.body.totalInvestments,
    portfolioCompanies: req.body.portfolioCompanies
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

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
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      startupName: user.startupName,
      industry: user.industry,
      location: user.location,
      foundedYear: user.foundedYear,
      teamSize: user.teamSize,
      fundingNeeded: user.fundingNeeded,
      pitchSummary: user.pitchSummary,
      investmentStage: user.investmentStage,
      investmentInterests: user.investmentInterests,
      minimumInvestment: user.minimumInvestment,
      maximumInvestment: user.maximumInvestment,
      totalInvestments: user.totalInvestments,
      portfolioCompanies: user.portfolioCompanies,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      walletBalance: user.walletBalance
    }
  });
};
