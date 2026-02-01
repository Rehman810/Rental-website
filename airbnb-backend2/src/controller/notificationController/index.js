import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} from '../../config/notifications/notificationService.js';

export const notificationController = {

  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page, limit, isRead } = req.query;

      const result = await getUserNotifications(userId, { page, limit, isRead });

      res.status(200).json({
        message: 'Notifications fetched successfully.',
        ...result,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;
      const count = await getUnreadCount(userId);

      res.status(200).json({
        message: 'Unread count fetched successfully.',
        unreadCount: count,
      });
    } catch (error) {
      console.error('Error fetching unread count:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.notificationId;

      const notification = await markAsRead(userId, notificationId);

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found.' });
      }

      res.status(200).json({
        message: 'Notification marked as read successfully.',
        notification,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      await markAllAsRead(userId);

      res.status(200).json({
        message: 'All notifications marked as read successfully.',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  deleteNotification: async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.notificationId;

      const result = await deleteNotification(userId, notificationId);

      if (!result) {
        return res.status(404).json({ message: 'Notification not found.' });
      }

      res.status(200).json({
        message: 'Notification deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting notification:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
};

