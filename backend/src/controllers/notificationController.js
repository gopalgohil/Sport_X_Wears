import Notification from '../models/Notification.js';

/**
 * @route   GET /api/v1/notifications
 * @desc    Fetch notifications for current user/admin with unread count
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const query = isAdmin
      ? { $or: [{ recipientRole: 'admin' }, { recipient: req.user._id }] }
      : { recipient: req.user._id };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('[Get Notifications Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching notifications',
    });
  }
};

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('[Mark Notification Read Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating notification',
    });
  }
};

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all notifications as read for current user/admin
 * @access  Private
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const query = isAdmin
      ? { $or: [{ recipientRole: 'admin' }, { recipient: req.user._id }] }
      : { recipient: req.user._id };

    await Notification.updateMany({ ...query, read: false }, { read: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('[Mark All Read Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error marking notifications read',
    });
  }
};

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Notification removed successfully',
    });
  } catch (error) {
    console.error('[Delete Notification Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting notification',
    });
  }
};

/**
 * @route   DELETE /api/v1/notifications/clear-all
 * @desc    Clear all notifications for user/admin
 * @access  Private
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const query = isAdmin
      ? { $or: [{ recipientRole: 'admin' }, { recipient: req.user._id }] }
      : { recipient: req.user._id };

    await Notification.deleteMany(query);

    return res.status(200).json({
      success: true,
      message: 'Notification history cleared',
    });
  } catch (error) {
    console.error('[Clear Notifications Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error clearing notifications',
    });
  }
};
