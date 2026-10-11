import mongoose from 'mongoose';

/**
 * Enterprise Notification Schema
 * Supports Admin telemetry and Customer order life-cycle tracking
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'customer', 'all'],
      default: 'admin',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['new_order', 'order_status', 'customer_registered', 'system'],
      default: 'new_order',
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    meta: {
      customerName: { type: String, default: '' },
      customerEmail: { type: String, default: '' },
      totalAmount: { type: Number, default: 0 },
      orderStatus: { type: String, default: '' },
      itemsCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ recipientRole: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
