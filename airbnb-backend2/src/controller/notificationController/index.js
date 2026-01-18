import Notification from '../../model/notification/index.js';

export const notificationController = {


    createNotification: async (data) => {
        try {
          const notification = new Notification(data);
          return await notification.save();
        } catch (error) {
          console.error('Error creating notification:', error.message);
          throw new Error('Failed to create notification.');
        }
      },


  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id; 
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 }) // Most recent first
        .select('message isRead createdAt type listingId'); 

      res.status(200).json({
        message: 'Notifications fetched successfully.',
        notifications,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },


  getUnreadNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications = await Notification.find({ userId, isRead: false })
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: 'Unread notifications fetched successfully.',
        notifications,
      });
    } catch (error) {
      console.error('Error fetching unread notifications:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const notificationId = req.params.notificationId;
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found.' });
      }

      notification.isRead = true;
      await notification.save();

      res.status(200).json({
        message: 'Notification marked as read successfully.',
        notification,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
};

