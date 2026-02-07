import { useState } from "react";
import { getAuthToken, getAuthUser } from "../../utils/cookieUtils";
import { APP_NAME } from "../../config/env";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Drawer,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Language as GlobalIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import LoginModal from "../Login/LoginModal";
import SearchBar from "../searchBar/searchBar";
import SearchBar2 from "../searchBar/searchBar2";
import NotificationBell from "../notifications/NotificationBell";
import { useNavigate } from "react-router-dom";
import handleLogout from "../logout/logout";
import VerifyToken from "../protected/verifyToken";
import Language from "../language/Language";
import { useTranslation } from "react-i18next";
import {
  Logout as LogoutIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Luggage as LuggageIcon,
  HelpOutline as HelpOutlineIcon,
  HomeWorkOutlined as HomeWorkOutlinedIcon,
  MailOutline as MailOutlineIcon,
  PersonOutline as PersonOutlineIcon,
  DashboardCustomizeOutlined as DashboardCustomizeOutlinedIcon,
  Login as LoginIcon,
  PersonAddAlt as PersonAddAltIcon,
} from "@mui/icons-material";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import MobileSearchBar from "../searchBar/mobileSearchbar";

const VerifiedMenu = ({ anchorEl, handleMenuClose, navigate, handleLogout }) => {
  const { t } = useTranslation();

  const menuSx = {
    mt: 1.2,
    "& .MuiPaper-root": {
      borderRadius: 3,
      minWidth: 240,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
    },
  };

  const itemSx = {
    py: 1.2,
    px: 1.5,
    "&:hover": { backgroundColor: "var(--bg-secondary)" },
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      keepMounted
      sx={menuSx}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem sx={itemSx} onClick={() => navigate("/user/guestAllMessages")}>
        <ListItemIcon>
          <MailOutlineIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.messages")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/trips")}>
        <ListItemIcon>
          <LuggageIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.trips")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/wishlist")}>
        <ListItemIcon>
          <FavoriteBorderIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.wishlists")} />
      </MenuItem>

      <Divider />

      <MenuItem sx={itemSx} onClick={() => navigate("/hosting/listings")}>
        <ListItemIcon>
          <DashboardCustomizeOutlinedIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.manageListings")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/profile")}>
        <ListItemIcon>
          <PersonOutlineIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.hostMenu2.userProfile")} />
      </MenuItem>

      <Divider />

      <MenuItem sx={itemSx} onClick={() => navigate("/user/help/feature")}>
        <ListItemIcon>
          <HelpOutlineIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.helpCenter")} />
      </MenuItem>

      <MenuItem
        sx={{
          ...itemSx,
          color: "error.main",
        }}
        onClick={() => handleLogout(navigate)}
      >
        <ListItemIcon sx={{ color: "error.main" }}>
          <LogoutIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.logout")} />
      </MenuItem>
    </Menu>
  );
};

const UnverifiedMenu = ({
  anchorEl,
  handleMenuClose,
  handleLoginModalOpen,
  handleSignUpModalOpen,
  navigate,
}) => {
  const { t } = useTranslation();

  const menuSx = {
    mt: 1.2,
    "& .MuiPaper-root": {
      borderRadius: 3,
      minWidth: 240,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
    },
  };

  const itemSx = {
    py: 1.2,
    px: 1.5,
    "&:hover": { backgroundColor: "var(--bg-secondary)" },
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      keepMounted
      sx={menuSx}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem sx={itemSx} onClick={handleLoginModalOpen}>
        <ListItemIcon>
          <LoginIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.login")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={handleSignUpModalOpen}>
        <ListItemIcon>
          <PersonAddAltIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.signUp")} />
      </MenuItem>

      <Divider />

      <MenuItem sx={itemSx} onClick={() => navigate("/hosting/listings")}>
        <ListItemIcon>
          <HomeWorkOutlinedIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.airbnbYourHome")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/help/feature")}>
        <ListItemIcon>
          <HelpOutlineIcon fontSize="small" sx={{ color: "var(--icon-primary)" }} />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.helpCenter")} />
      </MenuItem>
    </Menu>
  );
};

const drawerBtnSx = {
  justifyContent: "flex-start",
  textTransform: "none",
  fontWeight: 900,
  borderRadius: 2,
  py: 1.2,
};

const Navbar = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [signUp, isSignUp] = useState();
  const navigate = useNavigate();
  const token = getAuthToken();
  const user = getAuthUser();
  console.log(user);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLoginModalOpen = () => {
    isSignUp(false);
    setIsLoginModalOpen(true);
    handleMenuClose();
  };

  const handleSignUpModalOpen = () => {
    isSignUp(true);
    setIsLoginModalOpen(true);
    handleMenuClose();
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    navigate("/");
  };
  const toggleModal = () => {
    setOpen(!open);
  };

  const isMobile = useMediaQuery("(max-width:1100px)");

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        boxShadow: "none",
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid var(--border-light)",
        transition: "background-color 0.2s ease, color 0.2s ease",

        backdropFilter: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            minWidth: 160,
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
            {APP_NAME}
          </Typography>
        </Box>

        {!isMobile && (
          <Box>
            <SearchBar2 />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Button
              variant="text"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "var(--text-primary)",
                display: {
                  xs: "none",
                  sm: "inline-flex",
                },
                fontSize: "14px",
              }}
              onClick={() => navigate("/hosting/today")}
            >
              {!token
                ? t("navbar.airbnbYourHome")
                : t("navbar.switchToHosting")}
            </Button>
            {token && <NotificationBell />}
            <IconButton sx={{ color: "var(--text-primary)" }}>
              <GlobalIcon onClick={toggleModal} />
            </IconButton>
            <ThemeToggle />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid var(--border-light)",
              borderRadius: "30px",
              padding: "5px 10px",
              gap: "10px",
            }}
          >
            <Box
              onClick={(e) => {
                e.stopPropagation();
                if (isMobile) {
                  setDrawerOpen(true);
                } else {
                  setAnchorEl(e.currentTarget);
                  handleMenuOpen()
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                cursor: "pointer",
              }}
            >{!isMobile &&
              <IconButton
              >
                <MenuIcon />
              </IconButton>}
              <Avatar
                sx={{
                  bgcolor: user?.photoProfile ? "transparent" : "var(--bg-secondary)",
                  color: user?.photoProfile ? "inherit" : "var(--text-tertiary)",
                  width: 32,
                  height: 32,
                }}
                src={user?.photoProfile || null}
              >
                {!user?.photoProfile && user?.userName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Box>

            <VerifyToken
              VerifiedComponent={VerifiedMenu}
              UnverifiedComponent={UnverifiedMenu}
              anchorEl={anchorEl}
              handleMenuClose={handleMenuClose}
              navigate={navigate}
              handleLogout={handleLogout}
              handleLoginModalOpen={handleLoginModalOpen}
              handleSignUpModalOpen={handleSignUpModalOpen}
            />
          </Box>
        </Box>
      </Toolbar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 300,
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={user?.photoProfile || undefined}
                sx={{ width: 40, height: 40 }}
              >
                {!user?.photoProfile && user?.userName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontWeight={900}>
                  {user?.userName || "Guest"}
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)">
                  Account
                </Typography>
              </Box>
            </Box>

            <IconButton onClick={toggleDrawer(false)}>
              <MenuIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Menu Items */}
          <Stack spacing={1}>
            {token && (
              <>
                <Button
                  onClick={() => {
                    navigate("/user/trips");
                    setDrawerOpen(false);
                  }}
                  startIcon={<LuggageIcon />}
                  sx={drawerBtnSx}
                >
                  Trips
                </Button>

                <Button
                  onClick={() => {
                    navigate("/user/wishlist");
                    setDrawerOpen(false);
                  }}
                  startIcon={<FavoriteBorderIcon />}
                  sx={drawerBtnSx}
                >
                  Wishlist
                </Button>

                <Button
                  onClick={() => {
                    navigate("/hosting/listings");
                    setDrawerOpen(false);
                  }}
                  startIcon={<DashboardCustomizeOutlinedIcon />}
                  sx={drawerBtnSx}
                >
                  Manage listings
                </Button>
              </>
            )}

            {!token && (
              <>
                <Button
                  onClick={() => {
                    handleLoginModalOpen();
                    setDrawerOpen(false);
                  }}
                  startIcon={<LoginIcon />}
                  sx={drawerBtnSx}
                >
                  Login
                </Button>

                <Button
                  onClick={() => {
                    handleSignUpModalOpen();
                    setDrawerOpen(false);
                  }}
                  startIcon={<PersonAddAltIcon />}
                  sx={drawerBtnSx}
                >
                  Sign up
                </Button>
              </>
            )}

            <Divider />

            <Button
              onClick={() => {
                navigate("/user/help/feature");
                setDrawerOpen(false);
              }}
              startIcon={<HelpOutlineIcon />}
              sx={drawerBtnSx}
            >
              Help Center
            </Button>

            {token && (
              <Button
                onClick={() => handleLogout(navigate)}
                startIcon={<LogoutIcon />}
                color="error"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 900 }}
              >
                Logout
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>

      {isMobile ? <MobileSearchBar /> : <SearchBar />}
      <Divider />
      {isLoginModalOpen && (
        <LoginModal
          open={isLoginModalOpen}
          onClose={handleLoginModalClose}
          signUp={signUp}
          isSignUp={isSignUp}
        />
      )}
      <Language open={open} toggleModal={toggleModal} />
    </AppBar>
  );
};

export default Navbar;
