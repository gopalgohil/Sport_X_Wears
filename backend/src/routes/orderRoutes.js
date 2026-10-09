import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
} from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);

export default router;

