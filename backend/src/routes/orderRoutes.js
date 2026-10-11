import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(optionalAuth, createOrder)
  .get(optionalAuth, getAllOrders);

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', optionalAuth, updateOrderStatus);

export default router;

