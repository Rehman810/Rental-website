import React, { useState, useEffect } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
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
    console.log(notifications);

    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications(1); // Refresh on open
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markRead(notification._id);
        }

        if (notification.data && notification.data.actionUrl) {
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
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{ ml: 1 }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        width: 360,
                        maxHeight: 500,
                        mt: 1.5,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />

                {loading && notifications.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No notifications yet
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
                        {notifications.map((notification) => (
                            <React.Fragment key={notification._id}>
                                <ListItem
                                    alignItems="flex-start"
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                                        transition: '0.2s',
                                        '&:hover': { bgcolor: 'action.selected' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: notification.isRead ? 'grey.300' : 'primary.main' }}>
                                            {notification.isRead ? <CheckCircleIcon /> : <NotificationsIcon />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: notification.isRead ? 400 : 700 }}
                                            >
                                                {notification.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{ display: 'block', mb: 0.5 }}
                                                >
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {dayjs(notification.createdAt).fromNow()}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                    {!notification.isRead && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', ml: 1 }}>
                                            <CircleIcon color="primary" sx={{ fontSize: 12 }} />
                                        </Box>
                                    )}
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}

                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Button fullWidth onClick={() => navigate('/notifications')}>
                        View All
                    </Button>
                </Box>
            </Menu>
        </>
    );
};

export default NotificationBell;
