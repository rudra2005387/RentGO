const { User } = require('../models');
const { generateToken } = require('../utils/helpers');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');
const { sendOtpEmail } = require('../utils/resend');
const redisService = require('../services/redis.service');
const { asyncHandler, APIError } = require('../middleware/error.middleware');
const { cacheUserSession, logoutUser } = require('../middleware/cache.middleware');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const OTP_TTL_SECONDS = 5 * 60;
const OTP_KEY_PREFIX = 'otp:';

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Create new user
  const user = new User({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase(),
    password,
    phone,
    role: role || 'guest',
    isEmailVerified: false
  });

  // Save user to database
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Send welcome email
  await sendWelcomeEmail(user.email, user.firstName);

  // Return response without password
  const userResponse = user.getProfile();

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: userResponse,
      token
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new APIError('Email and password are required', 400);
  }

  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  // Check account lock
  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(429).json({
      success: false,
      message: 'Account locked due to multiple failed login attempts. Try again later.'
    });
  }

  // Compare passwords
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Increment failed login attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    // Lock account after 5 failed attempts
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();
      return res.status(429).json({
        success: false,
        message: 'Account locked due to multiple failed attempts. Try again in 30 minutes.'
      });
    }

    await user.save();
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Get user profile without password
  const userResponse = user.getProfile();

  // PHASE 1: Cache user session in Redis for faster authentication
  let tokenExpiresIn = 7 * 24 * 60 * 60;
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      tokenExpiresIn = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    }
  } catch (_) {
    // Fallback to default TTL
  }

  await cacheUserSession(user._id.toString(), userResponse, token, tokenExpiresIn);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token
    }
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  // PHASE 1: Blacklist token and invalidate session
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    let tokenExpiresIn = 7 * 24 * 60 * 60; // 7 days
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        tokenExpiresIn = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
      }
    } catch (_) {
      // Fallback to default TTL
    }
    await logoutUser(req.user.userId, token, tokenExpiresIn);
  }

  // Update user's last logout time
  await User.findByIdAndUpdate(req.user.userId, {
    lastLogin: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Refresh JWT token
 * POST /api/auth/refresh-token
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new APIError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new APIError('User not found or inactive', 401);
    }

    // Generate new token
    const newToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    throw new APIError('Invalid refresh token', 401);
  }
});

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Forgot Password - Send reset email
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new APIError('Email is required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if email exists or not (security best practice)
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to database (you would add resetPasswordToken and resetPasswordExpire fields to User model)
  // For now, we'll generate the token but you should store it
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Create reset link (this would be used in the email)
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    // Send email
    await sendPasswordResetEmail(user.email, user.firstName, resetLink);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new APIError('Error sending password reset email', 500);
  }
});

/**
 * Change Password - For authenticated users
 * POST /api/auth/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new APIError('Current password and new password are required', 400);
  }

  // Get user with password field
  const user = await User.findById(req.user.userId).select('+password');

  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new APIError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // PHASE 1: Invalidate cached session and token after password change
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    let tokenExpiresIn = 7 * 24 * 60 * 60;
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        tokenExpiresIn = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
      }
    } catch (_) {
      // Fallback to default TTL
    }
    await logoutUser(req.user.userId, token, tokenExpiresIn);
  } else {
    await logoutUser(req.user.userId, null, 0);
  }

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Verify email token
 * POST /api/auth/verify-email
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new APIError('Verification token is required', 400);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update user
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      throw new APIError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    throw new APIError('Invalid or expired verification token', 401);
  }
});

/**
 * Send OTP for passwordless login
 * POST /api/auth/send-otp
 */
exports.sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new APIError('Email is required', 400);
  }
if (!redisService.isAvailable()) {
  console.warn('Redis unavailable - OTP service running without Redis');
}

  const normalizedEmail = email.toLowerCase();
  const otpCode = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });

  const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
  const otpKey = `${OTP_KEY_PREFIX}${normalizedEmail}`;

  await redisService.set(otpKey, { otpHash }, OTP_TTL_SECONDS);
  await sendOtpEmail(normalizedEmail, otpCode);

  res.status(200).json({
    success: true,
    message: 'OTP sent to email'
  });
});

/**
 * Verify OTP for passwordless login
 * POST /api/auth/verify-otp
 */
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new APIError('Email and OTP are required', 400);
  }

  if (!redisService.isAvailable()) {
  console.warn('Redis unavailable - OTP verification running without Redis');
}

  const normalizedEmail = email.toLowerCase();
  const otpKey = `${OTP_KEY_PREFIX}${normalizedEmail}`;
  const cachedOtp = await redisService.get(otpKey);

  if (!cachedOtp || !cachedOtp.otpHash) {
    throw new APIError('OTP expired or invalid', 400);
  }

  const otpHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');
  if (otpHash !== cachedOtp.otpHash) {
    throw new APIError('Invalid OTP', 401);
  }

  await redisService.del(otpKey);

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const emailPrefix = normalizedEmail.split('@')[0] || 'Guest';
    const randomPassword = crypto.randomBytes(16).toString('hex');

    user = new User({
      firstName: emailPrefix.slice(0, 20),
      lastName: 'User',
      email: normalizedEmail,
      password: randomPassword,
      role: 'guest',
      isEmailVerified: true
    });

    await user.save();
  } else {
    user.isEmailVerified = true;
    user.lastLogin = new Date();
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  const token = generateToken(user._id, user.role);
  const userResponse = user.getProfile();

  let tokenExpiresIn = 7 * 24 * 60 * 60;
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      tokenExpiresIn = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    }
  } catch (_) {
    // Fallback to default TTL
  }

  await cacheUserSession(user._id.toString(), userResponse, token, tokenExpiresIn);

  res.status(200).json({
    success: true,
    message: 'OTP verified',
    data: {
      user: userResponse,
      token
    }
  });
});
