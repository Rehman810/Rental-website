import { useState } from "react";
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

const VerifiedMenu = ({ anchorEl, handleMenuClose, navigate, handleLogout }) => {
  const { t } = useTranslation();

  const menuSx = {
    mt: 1.2,
    "& .MuiPaper-root": {
      borderRadius: 3,
      minWidth: 240,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
      overflow: "hidden",
    },
  };

  const itemSx = {
    py: 1.2,
    px: 1.5,
    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
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
          <MailOutlineIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.messages")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/trips")}>
        <ListItemIcon>
          <LuggageIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.trips")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/wishlist")}>
        <ListItemIcon>
          <FavoriteBorderIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.wishlists")} />
      </MenuItem>

      <Divider />

      <MenuItem sx={itemSx} onClick={() => navigate("/hosting/listings")}>
        <ListItemIcon>
          <DashboardCustomizeOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.verified.manageListings")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/profile")}>
        <ListItemIcon>
          <PersonOutlineIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.hostMenu2.userProfile")} />
      </MenuItem>

      <Divider />

      <MenuItem sx={itemSx} onClick={() => navigate("/user/help/feature")}>
        <ListItemIcon>
          <HelpOutlineIcon fontSize="small" />
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
          <LogoutIcon fontSize="small" />
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
      boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
      overflow: "hidden",
    },
  };

  const itemSx = {
    py: 1.2,
    px: 1.5,
    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
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
          <LoginIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.login")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={handleSignUpModalOpen}>
        <ListItemIcon>
          <PersonAddAltIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.signUp")} />
      </MenuItem>

      <Divider />

      <MenuItem sx={itemSx} onClick={() => navigate("/hosting/listings")}>
        <ListItemIcon>
          <HomeWorkOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.airbnbYourHome")} />
      </MenuItem>

      <MenuItem sx={itemSx} onClick={() => navigate("/user/help/feature")}>
        <ListItemIcon>
          <HelpOutlineIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("menu.unverified.helpCenter")} />
      </MenuItem>
    </Menu>
  );
};


const Navbar = () => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [signUp, isSignUp] = useState();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

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

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "white",
        color: "black",
        boxShadow: "none",
        position: "sticky",
        top: 0,
        zIndex: 10,
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

        <Box>
          <SearchBar2 />
        </Box>

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
                color: "black",
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
            <IconButton>
              <GlobalIcon onClick={toggleModal} />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: "30px",
              padding: "5px 10px",
              gap: "10px",
            }}
          >
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                cursor: "pointer",
              }}
            >
              <IconButton>
                <MenuIcon />
              </IconButton>
              <Avatar
                sx={{
                  bgcolor: user?.photoProfile ? "transparent" : "#f2f2f2",
                  color: user?.photoProfile ? "inherit" : "gray",
                  width: 32,
                  height: 32,
                }}
                src={user?.photoProfile || null}
              >
                {!user?.photoProfile && user?.userName.charAt(0).toUpperCase()}
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
      <SearchBar />
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
