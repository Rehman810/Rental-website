import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MapIcon from "@mui/icons-material/Map";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/context";

const MotionBox = motion(Box);

const MobileBottomNav = () => {
  const { globalMapVisible: mapVisible, setGlobalMapVisible: setMapVisible } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === "__map__") return mapVisible;
    if (path === "/") return pathname === "/" && !mapVisible;
    return pathname.startsWith(path) && !mapVisible;
  };

  const tabs = [
    {
      label: t("common:mobileNav.home", "Home"),
      path: "/",
      icon: (active) => active ? <HomeIcon sx={{ fontSize: 24 }} /> : <HomeOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => { if (mapVisible) setMapVisible(false); navigate("/"); },
    },
    {
      label: t("common:mobileNav.map", "Map"),
      path: "__map__",
      icon: (active) => active ? <MapIcon sx={{ fontSize: 24 }} /> : <MapOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => {
        if (pathname !== "/") {
          setMapVisible(true);
          navigate("/");
        } else {
          setMapVisible(!mapVisible);
        }
      },
      isMap: true,
    },
    {
      label: t("common:mobileNav.wishlist", "Wishlist"),
      path: "/user/wishlist",
      icon: (active) => active ? <FavoriteIcon sx={{ fontSize: 24 }} /> : <FavoriteBorderIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/user/wishlist"),
    },
    {
      label: t("common:mobileNav.host", "Host"),
      path: "/hosting",
      icon: (active) => active ? <BusinessCenterIcon sx={{ fontSize: 24 }} /> : <BusinessCenterOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/hosting/today"),
    },
    {
      label: t("common:mobileNav.profile", "Profile"),
      path: "/user/profile",
      icon: (active) => active ? <PersonIcon sx={{ fontSize: 24 }} /> : <PersonOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/user/profile"),
    },
  ];

  return (
    <MotionBox
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: "var(--bg-primary)",
        borderTop: "1px solid var(--border-light)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.10)",
        // Safe area for iPhone notch / Android nav bar
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.isMap ? mapVisible : isActive(tab.path);
        return (
          <Box
            key={tab.label}
            onClick={tab.onClick}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 1,
              pt: 1.2,
              pb: 1.4,
              gap: 0.3,
              cursor: "pointer",
              position: "relative",
              color: active ? "#FF385C" : "var(--text-secondary)",
              transition: "color 0.2s ease",
              "&:active": { opacity: 0.7 },
              // Active indicator dot
              "&::before": active
                ? {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 28,
                    height: 2.5,
                    borderRadius: "0 0 4px 4px",
                    bgcolor: "#FF385C",
                  }
                : {},
            }}
          >
            {tab.icon(active)}
            <Typography
              sx={{
                fontSize: "0.62rem",
                fontWeight: active ? 800 : 500,
                lineHeight: 1,
                color: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </MotionBox>
  );
};

export default MobileBottomNav;
