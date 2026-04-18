import { Notification } from '../models/notification.model.js';

class NotificationRepository {
  async create(data) {
    const notification = new Notification(data);
    return notification.save();
  }

  async getByUser(userId, { page = 1, limit = 10, isRead }) {
    const query = { userId };
    if (isRead !== undefined) query.isRead = isRead;

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    return { notifications, total };
  }

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

export default new NotificationRepository();
