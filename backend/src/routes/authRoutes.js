import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  getAllUsersAdmin,
  updateUserRoleAdmin,
  deleteUserAdmin,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

// Admin User Management Routes
router.get('/users', protect, authorize('admin'), getAllUsersAdmin);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRoleAdmin);
router.delete('/users/:id', protect, authorize('admin'), deleteUserAdmin);

export default router;

