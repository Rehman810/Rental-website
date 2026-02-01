import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    initializeSocket,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    emitEvent,
    disconnectSocket
} from '../webSockets/webSockets';
import { fetchData, patchDataById, updateDataById } from '../config/ServiceApi/serviceApi';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const fetchNotifications = async (page = 1) => {
        if (!token) return;
        setLoading(true);
        try {
            // Backend GET /notifications
            const data = await fetchData(`notifications?page=${page}`, token);
            if (page === 1) {
                setNotifications(data.notifications);
            } else {
                setNotifications(prev => [...prev, ...data.notifications]);
            }
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        if (!token) return;
        try {
            const data = await fetchData('notifications/unread-count', token);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    };

    const markRead = async (notificationId) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n._id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await patchDataById('notifications', token, `${notificationId}/read`, {});
        } catch (error) {
            console.error("Failed to mark read", error);
            fetchNotifications(); // Revert on error
        }
    };

    const markAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            await patchDataById('notifications', token, 'read-all', {});
        } catch (error) {
            console.error("Failed to mark all read", error);
            fetchNotifications();
        }
    };

    useEffect(() => {
        if (user && token) {
            fetchUnreadCount();

            initializeSocket();

            // Join user room for private notifications
            // Backend socket.io/index.js uses 'join_room' event
            emitEvent('join_room', user._id || user.id);

            const handleNewNotification = (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Optional toast
                // toast(notification.title);
            };

            subscribeToUpdates('notification:new', handleNewNotification);

            return () => {
                unsubscribeFromUpdates('notification:new');
                // We don't necessarily disconnect here to avoid breaking other socket features like chat
            };
        }
    }, [user?._id, token]); // Re-run if user changes

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            markRead,
            markAllRead,
            fetchUnreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
