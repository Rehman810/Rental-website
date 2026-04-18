import notificationRepository from '../repositories/notification.repository.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, isRead } = req.query;

    const result = await notificationRepository.getByUser(userId, { page, limit, isRead });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationRepository.markAsRead(id, userId);
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationRepository.getUnreadCount(userId);
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
