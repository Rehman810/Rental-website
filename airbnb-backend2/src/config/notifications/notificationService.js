import Notification from '../../model/notification/index.js';

export const NOTIFICATION_TYPES = {
    AUTH_WELCOME: 'AUTH_WELCOME',
    AUTH_EMAIL_VERIFIED: 'AUTH_EMAIL_VERIFIED',
    AUTH_PASSWORD_RESET: 'AUTH_PASSWORD_RESET',
    BOOKING_PENDING_APPROVAL_HOST: 'BOOKING_PENDING_APPROVAL_HOST',
    BOOKING_PENDING_APPROVAL_GUEST: 'BOOKING_PENDING_APPROVAL_GUEST',
    BOOKING_APPROVED_GUEST: 'BOOKING_APPROVED_GUEST',
    BOOKING_APPROVED_HOST: 'BOOKING_APPROVED_HOST',
    BOOKING_REJECTED_GUEST: 'BOOKING_REJECTED_GUEST',
    BOOKING_EXPIRED_GUEST: 'BOOKING_EXPIRED_GUEST',
    BOOKING_REMINDER_24H_GUEST: 'BOOKING_REMINDER_24H_GUEST',
    BOOKING_REMINDER_24H_HOST: 'BOOKING_REMINDER_24H_HOST',
    LISTING_APPROVED_HOST: 'LISTING_APPROVED_HOST',
    LISTING_REJECTED_HOST: 'LISTING_REJECTED_HOST',
    CNIC_VERIFIED_USER: 'CNIC_VERIFIED_USER',
    EMAIL_VERIFIED_BY_ADMIN_USER: 'EMAIL_VERIFIED_BY_ADMIN_USER',
    NEW_MESSAGE: 'NEW_MESSAGE',
    SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT'
};

let ioInstance = null;

export const setSocket = (io) => {
    ioInstance = io;
};

export const createNotification = async ({ userId, type, title, message, role, data }) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            role,
            data,
        });
        const savedNotification = await notification.save();

        if (ioInstance) {
            // Emit to the user's room (userId)
            ioInstance.to(userId.toString()).emit('notification:new', savedNotification);
        }

        return savedNotification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        return null;
    }
};

export const markAsRead = async (userId, notificationId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

export const getUserNotifications = async (userId, { page = 1, limit = 10, isRead }) => {
    const query = { userId };
    if (isRead !== undefined) {
        if (isRead === 'true') query.isRead = true;
        if (isRead === 'false') query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
        .sort({ isRead: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return { notifications, total, unreadCount, page: parseInt(page), pages: Math.ceil(total / limit) };
};

export const getUnreadCount = async (userId) => {
    return await Notification.countDocuments({ userId, isRead: false });
};

export const deleteNotification = async (userId, notificationId) => {
    return await Notification.findOneAndDelete({ _id: notificationId, userId });
};
