import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { sendBrevoEmail, getOtpEmailTemplate, getPasswordResetOtpTemplate } from '../utils/sendEmail.js';

/**
 * Generate standard JWT signed token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'sportxwear_super_secret_jwt_key_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user & dispatch 6-digit OTP via Brevo
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit OTP & 10-minute validity
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    // Check existing email
    let user = await User.findOne({ email: normalizedEmail }).select('+password +verificationOtp +verificationOtpExpire');

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      }
      // If user exists but is unverified, update credentials & refresh OTP
      user.name = name;
      user.password = password;
      user.phone = phone || user.phone;
      user.verificationOtp = otp;
      user.verificationOtpExpire = otpExpire;
      await user.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone: phone || '',
        role: 'user',
        isVerified: false,
        verificationOtp: otp,
        verificationOtpExpire: otpExpire,
      });
    }

    // Dispatch 6-digit OTP email using Brevo REST API
    try {
      await sendBrevoEmail({
        toEmail: normalizedEmail,
        toName: name,
        subject: `Your SPORT X WEAR Verification Code: ${otp}`,
        htmlContent: getOtpEmailTemplate(name, otp),
      });
      console.log(`[Brevo Email Sent] 6-digit verification OTP delivered to: ${normalizedEmail}`);
    } catch (mailError) {
      console.error(`[Brevo Email Failed]:`, mailError.message);
      console.log(`\n==============================================`);
      console.log(`[DEV OTP LOG] Verification Code for ${normalizedEmail} is: ${otp}`);
      console.log(`==============================================\n`);
    }

    return res.status(200).json({
      success: true,
      requiresVerification: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify 6-digit OTP code & activate athlete account
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and 6-digit verification code.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+verificationOtp +verificationOtpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please register.',
      });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified.',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    if (!user.verificationOtp || user.verificationOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code. Please check your email.',
      });
    }

    if (new Date() > new Date(user.verificationOtpExpire)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Activate athlete account & wipe OTP fields
    user.isVerified = true;
    user.lastLogin = new Date();
    user.verificationOtp = undefined;
    user.verificationOtpExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to SPORT X WEAR.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP verification.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend 6-digit OTP code to email via Brevo
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+verificationOtp +verificationOtpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found with this email.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified. You can sign in directly.',
      });
    }

    // Generate fresh OTP & 10-minute expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Dispatch via Brevo
    try {
      await sendBrevoEmail({
        toEmail: normalizedEmail,
        toName: user.name,
        subject: `Your SPORT X WEAR Verification Code: ${otp}`,
        htmlContent: getOtpEmailTemplate(user.name, otp),
      });
      console.log(`[Brevo Email Resent] New OTP dispatched to: ${normalizedEmail}`);
    } catch (mailError) {
      console.error(`[Brevo Email Error]:`, mailError.message);
      console.log(`\n==============================================`);
      console.log(`[DEV OTP RESENT] Code for ${normalizedEmail} is: ${otp}`);
      console.log(`==============================================\n`);
    }

    return res.status(200).json({
      success: true,
      message: `A new 6-digit code has been sent to ${normalizedEmail}.`,
    });
  } catch (error) {
    console.error('[Resend OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error resending verification code.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & retrieve token (enforces email verification)
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user with password selected
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check email verification status
    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email address to activate your account.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user details
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user.',
    });
  }
};

/**
 * @route   PUT /api/v1/auth/update-profile
 * @desc    Update name, phone or address
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (addresses && Array.isArray(addresses)) fieldsToUpdate.addresses = addresses;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('[UpdateProfile Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Check if athlete is registered, generate 6-digit reset OTP and email it
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user is registered in the database
    const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordOtp +resetPasswordOtpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered athlete account found with this email. Please register first.',
      });
    }

    if (user.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not verified yet. Please complete registration first.',
      });
    }

    // Generate 6-digit OTP & 10-minute expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP via Brevo
    try {
      await sendBrevoEmail({
        toEmail: normalizedEmail,
        toName: user.name,
        subject: `Your SPORT X WEAR Password Reset Code: ${otp}`,
        htmlContent: getPasswordResetOtpTemplate(user.name, otp),
      });
      console.log(`[Brevo Email Sent] Password reset OTP sent to: ${normalizedEmail}`);
    } catch (mailError) {
      console.error(`[Brevo Email Error]:`, mailError.message);
      console.log(`\n==============================================`);
      console.log(`[DEV RESET OTP LOG] Code for ${normalizedEmail} is: ${otp}`);
      console.log(`==============================================\n`);
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${normalizedEmail}.`,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error processing password reset request.',
    });
  }
};

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Verify 6-digit reset OTP & update password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, verification OTP and new password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password +resetPasswordOtp +resetPasswordOtpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email.',
      });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code. Please check your email.',
      });
    }

    if (new Date() > new Date(user.resetPasswordOtpExpire)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Set new password (will be hashed automatically by userSchema pre-save hook)
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while resetting password.',
    });
  }
};

/**
 * @route   GET /api/v1/auth/users
 * @desc    Get all users with order stats and KPIs (Admin only)
 * @access  Private/Admin
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    const { search, role, isVerified } = req.query;

    const query = {};
    if (search) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { email: reg }, { phone: reg }];
    }
    if (role && role !== 'all') {
      query.role = role;
    }
    if (isVerified && isVerified !== 'all') {
      query.isVerified = isVerified === 'true';
    }

    const users = await User.find(query)
      .select('-password -verificationOtp -verificationOtpExpire -resetPasswordOtp -resetPasswordOtpExpire')
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate user orders metrics
    const orderStats = await Order.aggregate([
      { $match: { user: { $ne: null } } },
      {
        $group: {
          _id: '$user',
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const orderStatsMap = new Map();
    orderStats.forEach((stat) => {
      if (stat._id) {
        orderStatsMap.set(stat._id.toString(), stat);
      }
    });

    const enrichedUsers = users.map((u) => {
      const stats = orderStatsMap.get(u._id.toString());
      return {
        ...u,
        ordersCount: stats ? stats.ordersCount : 0,
        totalSpent: stats ? stats.totalSpent : 0,
        lastOrderDate: stats ? stats.lastOrderDate : null,
      };
    });

    // KPI metrics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = await User.countDocuments({ lastLogin: { $gte: twentyFourHoursAgo } });

    // Total spent across all users
    const allOrdersTotal = orderStats.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);

    return res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      kpis: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        activeToday,
        allOrdersTotal,
      },
      users: enrichedUsers,
    });
  } catch (error) {
    console.error('[Get All Users Admin Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching users.',
    });
  }
};

/**
 * @route   PUT /api/v1/auth/users/:id/role
 * @desc    Change user role (user/admin)
 * @access  Private/Admin
 */
export const updateUserRoleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin".',
      });
    }

    if (id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin privileges.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Update User Role Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating user role.',
    });
  }
};

/**
 * @route   DELETE /api/v1/auth/users/:id
 * @desc    Delete a user account
 * @access  Private/Admin
 */
export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    console.error('[Delete User Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting user.',
    });
  }
};


