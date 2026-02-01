import React, { useState } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Button,
    Divider,
    CircularProgress,
    Stack
} from '@mui/material';
import { NotificationsOutlined } from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationBell = () => {
    const {
        unreadCount,
        notifications,
        fetchNotifications,
        markRead,
        markAllRead,
        loading
    } = useNotification();

    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications(1); // Ensure fresh data on open
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markRead(notification._id);
        }
        if (notification.data?.actionUrl) {
            navigate(notification.data.actionUrl);
        }
        handleClose();
    };

    const handleMarkAllRead = (e) => {
        e.stopPropagation();
        markAllRead();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsOutlined />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                    mt: 1.2,
                    "& .MuiPaper-root": {
                        borderRadius: 3,
                        minWidth: 320,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
                        height: "500px",
                        overflowY: "auto",
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography fontWeight={900}>Notifications</Typography>
                        <Typography variant="body2" color="var(--text-secondary)">
                            {unreadCount ? `${unreadCount} unread` : "All caught up 🎉"}
                        </Typography>
                    </Box>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: 12 }}>
                            Mark all read
                        </Button>
                    )}
                </Box>

                <Divider />

                {loading && notifications.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: "center" }}>
                        <CircularProgress size={22} />
                    </Box>
                ) : notifications.length > 0 ? (
                    notifications.slice(0, 8).map((notification) => (
                        <MenuItem
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                py: 1.2,
                                px: 2,
                                alignItems: "flex-start",
                                whiteSpace: "normal",
                                backgroundColor: notification.isRead ? "transparent" : "rgba(25,118,210,0.06)",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                            }}
                        >
                            <Stack spacing={0.4}>
                                <Typography fontWeight={900} sx={{ fontSize: 13 }}>
                                    {notification.title || "Update"}
                                </Typography>
                                <Typography variant="body2" color="var(--text-secondary)">
                                    {notification.message || "You have a new notification."}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {dayjs(notification.createdAt).fromNow()}
                                </Typography>
                            </Stack>
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem sx={{ py: 2, px: 2 }}>
                        <Typography variant="body2" color="var(--text-secondary)">
                            No new notifications
                        </Typography>
                    </MenuItem>
                )}

                <Divider />

                <Box sx={{ px: 2, py: 1 }}>
                    <Button fullWidth size="small" onClick={() => navigate('/notifications')}>
                        View all notifications
                    </Button>
                </Box>
            </Menu>
        </>
    );
};

export default NotificationBell;
