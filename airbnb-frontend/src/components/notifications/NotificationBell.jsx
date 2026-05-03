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
import {
    NotificationsOutlined,
    MailOutline as MailIcon,
    CheckCircleOutline as SuccessIcon,
    EventAvailable as BookingIcon,
    InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';

dayjs.extend(relativeTime);

const NotificationBell = () => {
    const { t } = useTranslation();
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
                    mt: 1.5,
                    "& .MuiPaper-root": {
                        borderRadius: "20px",
                        width: { xs: "92vw", sm: 380 },
                        maxWidth: "100%",
                        border: "1px solid var(--border-light)",
                        borderColor: "divider",
                        boxShadow: "0 24px 54px rgba(0,0,0,0.15)",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <Box sx={{
                    px: 2.5,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: "1px solid",
                    borderColor: "divider"
                }}>
                    <Box>
                        <Typography variant="h6" fontWeight={900} sx={{ fontSize: "1.1rem" }}>
                            {t("translation:notifications")}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {unreadCount ? `${unreadCount} ${t("translation:unread")}` : t("translation:allCaughtUp")}
                        </Typography>
                    </Box>
                    {unreadCount > 0 && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleMarkAllRead}
                            sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: "none",
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" }
                            }}
                        >
                            {t("translation:markAllRead")}
                        </Button>
                    )}
                </Box>

                <Box sx={{ py: 1 }}>
                    {loading && notifications.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: "center" }}>
                            <CircularProgress size={24} thickness={5} sx={{ color: "var(--accent-primary)" }} />
                        </Box>
                    ) : notifications.length > 0 ? (
                        notifications.slice(0, 8).map((notification) => {
                            const title = (notification.title || "").toLowerCase();
                            const message = (notification.message || "").toLowerCase();

                            let Icon = InfoIcon;
                            let iconColor = "var(--text-secondary)";

                            if (title.includes("message") || message.includes("message")) {
                                Icon = MailIcon;
                                iconColor = "#1677ff";
                            } else if (title.includes("booking") || message.includes("booking")) {
                                Icon = BookingIcon;
                                iconColor = "var(--primary)";
                            } else if (title.includes("verified") || title.includes("success") || message.includes("verified")) {
                                Icon = SuccessIcon;
                                iconColor = "var(--success)";
                            }

                            return (
                                <MenuItem
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        py: 2,
                                        px: 2.5,
                                        mb: 0.5,
                                        mx: 1,
                                        borderRadius: "12px",
                                        alignItems: "flex-start",
                                        whiteSpace: "normal",
                                        backgroundColor: notification.isRead ? "transparent" : "rgba(var(--accent-rgb), 0.05)",
                                        borderLeft: notification.isRead ? "3px solid transparent" : "3px solid var(--accent-primary)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: "var(--bg-secondary)",
                                            transform: "translateX(4px)"
                                        },
                                    }}
                                >
                                    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Icon sx={{ fontSize: 20, color: iconColor }} />
                                        </Box>
                                        <Stack spacing={0.5} sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography fontWeight={900} sx={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                                                    {notification.title || "Update"}
                                                </Typography>
                                                {!notification.isRead && (
                                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--accent-primary)" }} />
                                                )}
                                            </Box>
                                            <Typography variant="body2" sx={{ color: "var(--text-secondary)", lineHeight: 1.5, fontSize: "0.85rem" }}>
                                                {notification.message || "You have a new notification."}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "var(--text-tertiary)", mt: 0.5, fontWeight: 600 }}>
                                                {dayjs(notification.createdAt).fromNow()}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </MenuItem>
                            );
                        })
                    ) : (
                        <Box sx={{ py: 6, textAlign: "center", px: 4 }}>
                            <NotificationsOutlined sx={{ fontSize: 40, opacity: 0.2, mb: 2 }} />
                            <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                {t("translation:noNotifications")}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {notifications.length > 0 && (
                    <>
                        <Divider sx={{ opacity: 0.6 }} />
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="medium"
                                onClick={() => navigate('/notifications')}
                                sx={{
                                    borderRadius: "12px",
                                    textTransform: "none",
                                    fontWeight: 900,
                                    boxShadow: "none",
                                    backgroundColor: "var(--bg-secondary)",
                                    color: "var(--text-primary)",
                                    "&:hover": {
                                        backgroundColor: "var(--bg-tertiary)",
                                        boxShadow: "none"
                                    }
                                }}
                            >
                                {t("translation:viewAllNotifications")}
                            </Button>
                        </Box>
                    </>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;
