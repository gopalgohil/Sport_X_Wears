import { Server } from 'socket.io';

let ioInstance = null;

/**
 * Initialize Socket.io on the Node HTTP server
 */
export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: false,
    },
    pingTimeout: 60000,
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Admin joins the dedicated admin room for instant business alerts
    socket.on('join_admin_room', () => {
      socket.join('admin-room');
      console.log(`[Socket.io] Admin joined 'admin-room': ${socket.id}`);
    });

    // Customer joins their personalized room based on user ID or temporary session
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.io] User ${userId} joined room: 'user:${userId}'`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return ioInstance;
};

/**
 * Access the active Socket.io instance
 */
export const getIO = () => {
  return ioInstance;
};

/**
 * Notify all connected Admins of a new order in realtime
 */
export const broadcastNewOrder = (notification) => {
  if (!ioInstance) return;
  ioInstance.to('admin-room').emit('new_order_notification', notification);
};

/**
 * Notify specific customer and admins of order lifecycle status changes (accepted, shipped, etc.)
 */
export const sendOrderStatusUpdate = (userId, notification, email = null) => {
  if (!ioInstance) return;

  const payload = {
    orderId: notification.order ? notification.order.toString() : null,
    orderStatus: notification.meta?.orderStatus || null,
    notification,
  };

  // Broadcast to customer's personal channel by user ID
  if (userId) {
    ioInstance.to(`user:${userId}`).emit('order_status_notification', notification);
    ioInstance.to(`user:${userId}`).emit('order_status_updated', payload);
  }

  // Also broadcast by customer email channel for guest or resilient routing
  if (email) {
    ioInstance.to(`user:${email.toLowerCase()}`).emit('order_status_notification', notification);
    ioInstance.to(`user:${email.toLowerCase()}`).emit('order_status_updated', payload);
  }

  // Also broadcast to admin room so admin UI reflects live status sync
  ioInstance.to('admin-room').emit('order_status_notification', notification);
  ioInstance.to('admin-room').emit('order_status_updated', payload);

  // Global broadcast so any active customer tab displaying this order reflects the new status instantly
  ioInstance.emit('order_status_updated', payload);
};
