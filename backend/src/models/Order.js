import mongoose from 'mongoose';

/**
 * Order Item Subdocument Schema
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    priceAtPurchase: {
      type: Number,
      required: [true, 'Price at purchase is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    _id: true,
  }
);

/**
 * Order Schema
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must contain items'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order items array cannot be empty',
      },
    },
    shippingAddress: {
      street: { type: String, required: [true, 'Shipping street is required'] },
      city: { type: String, required: [true, 'Shipping city is required'] },
      state: { type: String, default: '' },
      postalCode: { type: String, required: [true, 'Postal code is required'] },
      country: { type: String, required: [true, 'Country is required'], default: 'IN' },
    },
    paymentDetails: {
      method: {
        type: String,
        required: true,
        enum: ['cod', 'upi', 'card', 'stripe', 'paypal'],
        default: 'cod',
      },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: {
        type: String,
        default: null,
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for ultra-fast customer order history lookups
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
