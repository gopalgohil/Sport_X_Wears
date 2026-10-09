import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Create a new order & deduct inventory
 * @route   POST /api/v1/orders
 * @access  Public / Customer
 */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    shippingAddress,
    paymentMethod = 'cod',
    transactionId,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  if (!customer?.name || !customer?.email || !customer?.phone) {
    throw new ApiError(400, 'Customer name, email, and phone are required');
  }

  if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.postalCode) {
    throw new ApiError(400, 'Complete shipping address is required');
  }

  // Verify stock & calculate accurate total server-side
  let calculatedTotal = 0;
  const processedItems = [];

  for (const item of items) {
    const productDoc = await Product.findById(item.product);
    if (!productDoc) {
      throw new ApiError(404, `Product '${item.title}' was not found`);
    }

    if (productDoc.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for '${productDoc.title}'. Only ${productDoc.stock} available.`
      );
    }

    const price = productDoc.discountPrice || productDoc.price;
    calculatedTotal += price * item.quantity;

    processedItems.push({
      product: productDoc._id,
      title: productDoc.title,
      size: item.size || 'M',
      quantity: item.quantity,
      priceAtPurchase: price,
      image: item.image || productDoc.images[0] || '',
    });

    // Reduce product inventory
    productDoc.stock -= item.quantity;
    await productDoc.save();
  }

  // Free shipping over 1999, else 149
  const shippingFee = calculatedTotal >= 1999 ? 0 : 149;
  const finalTotal = calculatedTotal + shippingFee;

  const order = await Order.create({
    user: req.user?._id || null,
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone.trim(),
    },
    items: processedItems,
    shippingAddress: {
      street: shippingAddress.street.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state?.trim() || '',
      postalCode: shippingAddress.postalCode.trim(),
      country: shippingAddress.country?.trim() || 'IN',
    },
    paymentDetails: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'paid',
      transactionId: paymentMethod === 'cod' ? null : (transactionId ? String(transactionId).trim() : `TXN_${Date.now()}`),
    },
    totalAmount: finalTotal,
    orderStatus: 'processing',
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

/**
 * @desc    Get order details by ID
 * @route   GET /api/v1/orders/:id
 * @access  Public
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('items.product', 'title slug images')
    .lean();

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Get current user's order history
 * @route   GET /api/v1/orders/my-orders
 * @access  Private (Athletes)
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const query = {
    $or: [
      { user: req.user._id },
      { 'customer.email': req.user.email.toLowerCase() },
    ],
  };

  const orders = await Order.find(query)
    .populate('items.product', 'title slug images price discountPrice')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

