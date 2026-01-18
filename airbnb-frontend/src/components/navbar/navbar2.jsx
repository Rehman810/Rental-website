import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Drawer,
  Button,
  useMediaQuery,
  Paper,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  DashboardCustomizeOutlined as DashboardIcon,
  CalendarMonthOutlined as CalendarIcon,
  HomeWorkOutlined as ListingsIcon,
  MailOutline as MailIcon,
  PaymentsOutlined as PaymentsIcon,
  PersonOutline as PersonIcon,
  HelpOutline as HelpIcon,
  Logout as LogoutIcon,
  TravelExplore as TravelIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import handleLogout from "../logout/logout";
import { useTranslation } from "react-i18next";
import {
  initializeSocket,
  subscribeToUpdates,
  unsubscribeFromUpdates,
} from "../../webSockets/webSockets";
import axios from "axios";

initializeSocket();

const NavbarHost = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationsMenuAnchorEl, setNotificationsMenuAnchorEl] = useState(null);
  const [avatarMenuAnchorEl, setAvatarMenuAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const isMobile = useMediaQuery("(max-width:900px)");
  const isHostArea = location.pathname.includes("hosting");

  const unreadCount = useMemo(() => {
    return notifications?.filter((n) => !n?.isRead)?.length || 0;
  }, [notifications]);

  const menuItems = useMemo(
    () => [
      { name: t("menu.hostMenu.today"), route: "/hosting/today", icon: <DashboardIcon fontSize="small" /> },
      { name: t("menu.hostMenu.calendar"), route: "/hosting/calendar", icon: <CalendarIcon fontSize="small" /> },
      { name: t("menu.hostMenu.listings"), route: "/hosting/listings", icon: <ListingsIcon fontSize="small" /> },
      { name: t("menu.hostMenu.messages"), route: "/hosting/messages", icon: <MailIcon fontSize="small" /> },
      { name: "Payments", route: "/hosting/payments", icon: <PaymentsIcon fontSize="small" /> },
    ],
    [t]
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      try {
        const response = await axios.get(`http://192.168.18.45:5000/notifications`, config);
        setNotifications(response?.data?.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const handleNewNotification = (payload) => {
      // If you want realtime add:
      // setNotifications((prev) => [payload, ...prev]);
      console.log("Received new notification:", payload);
    };

    subscribeToUpdates("new_notification", handleNewNotification);

    return () => {
      unsubscribeFromUpdates("new_notification");
    };
  }, [token]);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleNotificationsMenuOpen = (event) => setNotificationsMenuAnchorEl(event.currentTarget);
  const handleNotificationsMenuClose = () => setNotificationsMenuAnchorEl(null);

  const handleAvatarMenuOpen = (event) => setAvatarMenuAnchorEl(event.currentTarget);
  const handleAvatarMenuClose = () => setAvatarMenuAnchorEl(null);

  const initials = user?.userName?.charAt(0)?.toUpperCase() || "H";

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: 30,
        backgroundColor: "rgba(255,255,255,0.92)",
        color: "black",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 1.5, md: 2.5 },
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Left - Brand */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            minWidth: 170,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: "linear-gradient(135deg, #ff385c, #ff5a5f)",
              boxShadow: "0 12px 30px rgba(255,56,92,0.25)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.3px",
              userSelect: "none",
            }}
          >
            ThePakbnb
          </Typography>

          <ChipLike label="Host" />
        </Box>

        {/* Center - Host Tabs (Desktop only) */}
        {isHostArea && !isMobile && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                px: 0.8,
                py: 0.6,
                borderRadius: 999,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              {menuItems.map((menu) => {
                const active = location.pathname === menu.route;

                return (
                  <Link
                    key={menu.route}
                    to={menu.route}
                    style={{ textDecoration: "none" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        px: 1.3,
                        py: 0.9,
                        borderRadius: 999,
                        fontWeight: 900,
                        fontSize: "13px",
                        color: active ? "text.primary" : "text.secondary",
                        backgroundColor: active ? "white" : "transparent",
                        border: active ? "1px solid" : "1px solid transparent",
                        borderColor: active ? "divider" : "transparent",
                        boxShadow: active ? "0 10px 25px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          backgroundColor: active ? "white" : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      {menu.icon}
                      <Typography sx={{ fontWeight: 900, fontSize: "13px" }}>
                        {menu.name}
                      </Typography>
                    </Box>
                  </Link>
                );
              })}
            </Paper>
          </Box>
        )}

        {/* Right - Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationsMenuOpen}
              sx={{
                borderRadius: 999,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ fontSize: 24, color: "text.secondary" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationsMenuAnchorEl}
            open={Boolean(notificationsMenuAnchorEl)}
            onClose={handleNotificationsMenuClose}
            sx={{
              mt: 1.2,
              "& .MuiPaper-root": {
                borderRadius: 3,
                minWidth: 320,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
                overflow: "hidden",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography fontWeight={900}>Notifications</Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount ? `${unreadCount} unread` : "All caught up 🎉"}
              </Typography>
            </Box>

            <Divider />

            {notifications?.length > 0 ? (
              notifications.slice(0, 8).map((notification, index) => (
                <MenuItem
                  key={index}
                  onClick={handleNotificationsMenuClose}
                  sx={{
                    py: 1.2,
                    px: 2,
                    alignItems: "flex-start",
                    whiteSpace: "normal",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                  }}
                >
                  <Stack spacing={0.4}>
                    <Typography fontWeight={900} sx={{ fontSize: 13 }}>
                      {notification?.title || "Update"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {notification?.message || "You have a new notification."}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))
            ) : (
              <MenuItem onClick={handleNotificationsMenuClose} sx={{ py: 2, px: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No new notifications
                </Typography>
              </MenuItem>
            )}
          </Menu>

          {/* Avatar Menu (Desktop) */}
          {!isMobile && (
            <>
              <Paper
                elevation={0}
                onClick={handleAvatarMenuOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.6,
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: user?.photoProfile ? "transparent" : "rgba(0,0,0,0.06)",
                    fontWeight: 900,
                  }}
                  src={user?.photoProfile || undefined}
                >
                  {!user?.photoProfile && initials}
                </Avatar>
              </Paper>

              <Menu
                anchorEl={avatarMenuAnchorEl}
                open={Boolean(avatarMenuAnchorEl)}
                onClose={handleAvatarMenuClose}
                sx={{
                  mt: 1.2,
                  "& .MuiPaper-root": {
                    borderRadius: 3,
                    minWidth: 260,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography fontWeight={900}>{user?.userName || "Host"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || "Host account"}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem onClick={() => navigate("/user/profile")} sx={{ py: 1.2, px: 2 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("menu.hostMenu2.userProfile")} />
                </MenuItem>

                <MenuItem onClick={() => navigate("/user/help/feature")} sx={{ py: 1.2, px: 2 }}>
                  <ListItemIcon>
                    <HelpIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("menu.hostMenu2.visitHelpCenter")} />
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => navigate("/")} sx={{ py: 1.2, px: 2 }}>
                  <ListItemIcon>
                    <TravelIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("menu.hostMenu2.switchToTravelling")} />
                </MenuItem>

                <MenuItem
                  onClick={() => handleLogout(navigate)}
                  sx={{ py: 1.2, px: 2, color: "error.main" }}
                >
                  <ListItemIcon sx={{ color: "error.main" }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t("menu.hostMenu2.logout")} />
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Mobile Drawer Button */}
          <IconButton
            sx={{
              display: { xs: "inline-flex", md: "none" },
              borderRadius: 999,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Drawer (Right side - better UX) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 320,
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar
                src={user?.photoProfile || undefined}
                sx={{ width: 42, height: 42, fontWeight: 900 }}
              >
                {!user?.photoProfile && initials}
              </Avatar>
              <Box>
                <Typography fontWeight={900}>{user?.userName || "Host"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Host dashboard
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Navigation
          </Typography>

          <Stack spacing={0.8}>
            {menuItems.map((menu) => {
              const active = location.pathname === menu.route;
              return (
                <Button
                  key={menu.route}
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate(menu.route);
                  }}
                  startIcon={menu.icon}
                  variant={active ? "contained" : "text"}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    fontWeight: 900,
                    borderRadius: 2,
                    py: 1.2,
                  }}
                >
                  {menu.name}
                </Button>
              );
            })}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Account
          </Typography>

          <Stack spacing={0.8}>
            <Button
              onClick={() => {
                setDrawerOpen(false);
                navigate("/user/profile");
              }}
              startIcon={<PersonIcon />}
              sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 900, borderRadius: 2, py: 1.2 }}
            >
              {t("menu.hostMenu2.userProfile")}
            </Button>

            <Button
              onClick={() => {
                setDrawerOpen(false);
                navigate("/user/help/feature");
              }}
              startIcon={<HelpIcon />}
              sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 900, borderRadius: 2, py: 1.2 }}
            >
              {t("menu.hostMenu2.visitHelpCenter")}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setDrawerOpen(false);
                navigate("/");
              }}
              startIcon={<TravelIcon />}
              sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2, py: 1.2 }}
            >
              {t("menu.hostMenu2.switchToTravelling")}
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => handleLogout(navigate)}
              startIcon={<LogoutIcon />}
              sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2, py: 1.2 }}
            >
              {t("menu.hostMenu2.logout")}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Divider />
    </AppBar>
  );
};

const ChipLike = ({ label }) => (
  <Box
    sx={{
      ml: 1,
      px: 1.1,
      py: 0.35,
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 900,
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "rgba(0,0,0,0.02)",
      color: "text.secondary",
      display: { xs: "none", sm: "inline-flex" },
    }}
  >
    {label}
  </Box>
);

export default NavbarHost;
