import { useEffect, useMemo, useState } from "react";
import { getAuthToken, getAuthUser } from "../../utils/cookieUtils";
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
  SettingsOutlined as SettingsIcon,
  BookOnlineOutlined as BookOnlineIcon,
  Language as GlobalIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import handleLogout from "../logout/logout";
import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../language/Localization";
import {
  initializeSocket,
  subscribeToUpdates,
  unsubscribeFromUpdates,
} from "../../webSockets/webSockets";
import axios from "axios";
import { APP_NAME } from "../../config/env";
import NotificationBell from "../notifications/NotificationBell";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import RoleSwitchLoader from "../loading/RoleSwitchLoader";
import { useTheme } from "../../context/ThemeContext";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import Language from "../language/Language";

initializeSocket();

const NavbarHost = () => {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationsMenuAnchorEl, setNotificationsMenuAnchorEl] = useState(null);
  const [avatarMenuAnchorEl, setAvatarMenuAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchState, setSwitchState] = useState({ open: false, role: '', path: '' });
  const [langModalOpen, setLangModalOpen] = useState(false);

  const toggleLangModal = () => setLangModalOpen(!langModalOpen);

  const handleRoleSwitch = (role, path) => {
    setSwitchState({ open: true, role, path });
    setTimeout(() => {
      navigate(path);
      setSwitchState({ open: false, role: '', path: '' });
    }, 1500);
  };

  const [notifications, setNotifications] = useState([]);
  const user = getAuthUser();
  const token = getAuthToken();

  const isMobile = useMediaQuery("(max-width:900px)");
  const isHostArea = location.pathname.includes("hosting");

  const unreadCount = useMemo(() => {
    return notifications?.filter((n) => !n?.isRead)?.length || 0;
  }, [notifications]);

  const menuItems = useMemo(
    () => [
      { name: t("menu.hostMenu.dashboard"), route: "/hosting/dashboard", icon: <DashboardIcon fontSize="small" /> },
      { name: t("menu.hostMenu.today"), route: "/hosting/today", icon: <DashboardIcon fontSize="small" /> },
      { name: t("menu.hostMenu.calendar"), route: "/hosting/calendar", icon: <CalendarIcon fontSize="small" /> },
      { name: t("menu.hostMenu.listings"), route: "/hosting/listings", icon: <ListingsIcon fontSize="small" /> },
      { name: t("menu.hostMenu.messages"), route: "/hosting/messages", icon: <MailIcon fontSize="small" /> },
      { name: t("menu.hostMenu.payments"), route: "/hosting/payments", icon: <PaymentsIcon fontSize="small" /> },
      { name: t("menu.hostMenu.settings"), route: "/hosting/settings", icon: <SettingsIcon fontSize="small" /> },
    ],
    [t]
  );

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleNotificationsMenuOpen = (event) => setNotificationsMenuAnchorEl(event.currentTarget);
  const handleNotificationsMenuClose = () => setNotificationsMenuAnchorEl(null);

  const handleAvatarMenuOpen = (event) => setAvatarMenuAnchorEl(event.currentTarget);
  const handleAvatarMenuClose = () => setAvatarMenuAnchorEl(null);

  const initials = user?.userName?.charAt(0)?.toUpperCase() || "H";

  const isRTL = useRTL();

  return (
    <RTLWrapper>
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: 1300,
        backgroundColor: "rgba(var(--bg-primary-rgb), 0.8)",
        color: "var(--text-primary)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 1.5, md: 3 },
          py: 0.5,
          display: "flex",
          justifyContent: "space-between",
          minHeight: { xs: "64px", md: "80px" },
          gap: 2,
        }}
      >
        {/* Left - Brand */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            minWidth: { xs: 80, sm: 170 },
            transition: "transform 0.2s ease",
            "&:hover": { transform: "scale(1.02)" }
          }}
        >
          <img
            src={resolvedTheme === "dark" ? "/Logo-dark.png" : "/Logo-light.png"}
            alt={APP_NAME}
            style={{ 
              height: isMobile ? 40 : 55, 
              objectFit: "contain",
              transition: "height 0.3s ease"
            }}
          />

          <ChipLike label={t("hosting.dashboard.host")} />
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
                borderColor: "var(--border-light)",
                backgroundColor: "var(--bg-secondary)",
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
                        color: active ? "var(--text-primary)" : "var(--text-secondary)",
                        backgroundColor: active ? "var(--bg-card)" : "transparent",
                        border: active ? "1px solid" : "1px solid transparent",
                        borderColor: active ? "var(--border-light)" : "transparent",
                        boxShadow: active ? "var(--shadow-sm)" : "none",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          backgroundColor: "var(--bg-tertiary)",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.5 }}>
            <ThemeToggle />

            <IconButton
              onClick={toggleLangModal}
              sx={{ color: "var(--text-primary)" }}
            >
              <GlobalIcon />
            </IconButton>
            <LanguageToggle />
          </Box>

          {token && <NotificationBell />}

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
                  borderColor: "var(--border-light)",
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
                  <Typography variant="body2" color="var(--text-secondary)">
                    {user?.email || "Host account"}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem onClick={() => navigate("/user/profile")} sx={{ py: 1.2, px: 2 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
                  </ListItemIcon>
                  <ListItemText primary={t("menu.hostMenu2.userProfile")} />
                </MenuItem>

                <MenuItem onClick={() => navigate("/user/help/feature")} sx={{ py: 1.2, px: 2 }}>
                  <ListItemIcon>
                    <HelpIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
                  </ListItemIcon>
                  <ListItemText primary={t("menu.hostMenu2.visitHelpCenter")} />
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => { handleAvatarMenuClose(); handleRoleSwitch('guest', '/'); }} sx={{ py: 1.2, px: 2 }}>
                  <ListItemIcon>
                    <TravelIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
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
        anchor={isRTL ? "left" : "right"}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 320,
            [isRTL ? "borderTopRightRadius" : "borderTopLeftRadius"]: 18,
            [isRTL ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 18,
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
                <Typography fontWeight={900}>{user?.userName || t("hosting.dashboard.host")}</Typography>
                <Typography variant="body2" color="var(--text-secondary)">
                  {t("hosting.dashboard.hostDashboard")}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 1 }}>
            {t("hosting.dashboard.navigation")}
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

          <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 1 }}>
            {t("hosting.dashboard.account")}
          </Typography>

          {/* <Stack spacing={0.8}>
            <Button
              onClick={() => {
                setDrawerOpen(false);
                navigate("/user/profile");
              }}
              startIcon={<PersonIcon color="var(--text-secondary)" />}
              sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 900, borderRadius: 2, py: 1.2, color: "var(--text-secondary)" }}
            >
              {t("menu.hostMenu2.userProfile")}
            </Button>

            <Button
              onClick={() => {
                setDrawerOpen(false);
                navigate("/user/help/feature");
              }}
              startIcon={<HelpIcon color="var(--text-secondary)" />}
              sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 900, borderRadius: 2, py: 1.2, color: "var(--text-secondary)" }}
            >
              {t("menu.hostMenu2.visitHelpCenter")}
            </Button>
          </Stack> */}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 1 }}>
            {t("hosting.dashboard.settings")}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
             <Box sx={{ flex: 1 }}><ThemeToggle /></Box>
             <Box sx={{ flex: 1 }}><LanguageToggle /></Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setDrawerOpen(false);
                handleRoleSwitch('guest', '/');
              }}
              startIcon={<TravelIcon color="var(--text-secondary)" />}
              sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2, py: 1.2, color: "var(--text-secondary)" }}
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
      <Language open={langModalOpen} toggleModal={toggleLangModal} />
    </AppBar>
    {switchState.open && <RoleSwitchLoader open={switchState.open} targetRole={switchState.role} />}
    </RTLWrapper>
  );
};

const ChipLike = ({ label }) => (
  <Box
    sx={{
      ml: 1,
      px: 1.5,
      py: 0.5,
      borderRadius: "8px",
      fontSize: 11,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      border: "1px solid var(--accent-primary)",
      backgroundColor: "rgba(var(--accent-rgb), 0.1)",
      color: "var(--accent-primary)",
      display: { xs: "none", sm: "inline-flex" },
    }}
  >
    {label}
  </Box>
);

export default NavbarHost;
