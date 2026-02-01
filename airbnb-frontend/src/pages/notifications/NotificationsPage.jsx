/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Paper,
    CircularProgress,
    Badge,
    ListItemAvatar,
    Avatar
} from '@mui/material';
import {
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Notifications as NotificationsIcon,
    DoneAll as DoneAllIcon,
    Circle as CircleIcon
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

const NotificationsPage = () => {
    const {
        notifications,
        loading,
        fetchNotifications,
        markRead,
        markAllRead,
        deleteNotification,
        unreadCount
    } = useNotification();

    const [filter, setFilter] = useState('all'); // 'all' or 'unread'
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch on mount with current filter
        loadNotifications(1, filter);
    }, []);

    const loadNotifications = (pageNum, currentFilter) => {
        const filters = {};
        if (currentFilter === 'unread') {
            filters.isRead = false;
        }
        fetchNotifications(pageNum, filters);
    };

    const handleFilterChange = (event, newValue) => {
        setFilter(newValue);
        setPage(1);
        loadNotifications(1, newValue);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadNotifications(nextPage, filter);
    };

    const handleNotificationClick = (n) => {
        if (!n.isRead) markRead(n._id);
        if (n.data && n.data.actionUrl) {
            navigate(n.data.actionUrl);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6, minHeight: '85vh' }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700} letterSpacing="-0.5px">
                        Notifications
                    </Typography>
                    <Typography variant="body2" color="var(--text-secondary)">
                        Stay in the loop. Act fast.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<DoneAllIcon />}
                    onClick={markAllRead}
                    disabled={loading || unreadCount === 0}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 2.5,

                        /* normal state */
                        boxShadow: "var(--shadow-sm)",

                        /* 🌙 disabled state – THIS IS THE KEY */
                        "&.Mui-disabled": {
                            backgroundColor: "var(--bg-tertiary)",
                            color: "var(--text-tertiary)",
                            border: "1px solid var(--border-muted)",
                            boxShadow: "none",
                            cursor: "not-allowed",
                        },

                        /* disabled icon */
                        "&.Mui-disabled .MuiButton-startIcon": {
                            color: "var(--text-tertiary)",
                        },
                    }}
                >
                    Mark all as read
                </Button>
            </Box>

            {/* Filters */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                }}
            >
                <Tabs
                    value={filter}
                    onChange={handleFilterChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.5,
                        },
                    }}
                >
                    <Tab label="All notifications" value="all" sx={{ color: "var(--text-primary)" }} />
                    <Tab
                        value="unread"
                        label={
                            <Badge badgeContent={unreadCount} color="error" sx={{ color: "var(--text-primary)" }}>
                                Unread
                            </Badge>
                        }
                    />
                </Tabs>
            </Paper>

            {/* Notifications List */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                }}
            >
                {loading && page === 1 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box
                        sx={{
                            py: 8,
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <NotificationsIcon sx={{ fontSize: 56, mb: 2, opacity: 0.4, color: "var(--text-primary)" }} />
                        <Typography sx={{ color: "var(--text-primary)" }}>No notifications yet</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {notifications.map((notification) => (
                            <React.Fragment key={notification._id}>
                                <ListItem
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        px: 3,
                                        py: 2.5,
                                        cursor: 'pointer',
                                        alignItems: 'flex-start',
                                        bgcolor: notification.isRead
                                            ? 'transparent'
                                            : 'rgba(25,118,210,0.06)',
                                        transition: 'all .2s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(25,118,210,0.1)',
                                        },
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification._id);
                                            }}
                                            sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor: notification.isRead
                                                    ? 'grey.200'
                                                    : 'primary.main',
                                                color: notification.isRead ? 'var(--text-secondary)' : '#fff',
                                            }}
                                        >
                                            {notification.isRead ? (
                                                <CheckCircleIcon fontSize="small" />
                                            ) : (
                                                <NotificationsIcon fontSize="small" />
                                            )}
                                        </Avatar>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={notification.isRead ? 500 : 700}
                                                >
                                                    {notification.title}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="var(--text-secondary)"
                                                    sx={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {dayjs(notification.createdAt).fromNow()}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography variant="body2" color="var(--text-secondary)">
                                                    {notification.message}
                                                </Typography>

                                                {!notification.isRead && (
                                                    <Box
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            mt: 1,
                                                            px: 1.2,
                                                            py: 0.3,
                                                            borderRadius: 10,
                                                            bgcolor: 'primary.main',
                                                            color: '#fff',
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            width: 'fit-content',
                                                        }}
                                                    >
                                                        New
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>

                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            {/* Pagination */}
            {notifications.length > 0 && notifications.length % 10 === 0 && !loading && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                        onClick={handleLoadMore}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Load more
                    </Button>
                </Box>
            )}

            {loading && page > 1 && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <CircularProgress size={22} />
                </Box>
            )}
        </Container>

    );
};

export default NotificationsPage;
