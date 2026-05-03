import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import TodayIcon from "@mui/icons-material/Today";
import TodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ListIcon from "@mui/icons-material/ListAlt";
import ListOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

const MobileHostBottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const tabs = [
    {
      label: t("common:mobileNav.dashboard", "Dashboard"),
      path: "/hosting/dashboard",
      icon: (active) => active ? <HomeIcon sx={{ fontSize: 24 }} /> : <HomeOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/hosting/dashboard"),
    },
    {
      label: t("common:mobileNav.today", "Today"),
      path: "/hosting/today",
      icon: (active) => active ? <TodayIcon sx={{ fontSize: 24 }} /> : <TodayOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/hosting/today"),
    },
    {
      label: t("common:mobileNav.calendar", "Calendar"),
      path: "/hosting/calendar",
      icon: (active) => active ? <CalendarMonthIcon sx={{ fontSize: 24 }} /> : <CalendarMonthOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/hosting/calendar"),
    },
    {
      label: t("common:mobileNav.listings", "Listings"),
      path: "/hosting/listings",
      icon: (active) => active ? <ListIcon sx={{ fontSize: 24 }} /> : <ListOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/hosting/listings"),
    },
    {
      label: t("common:mobileNav.messages", "Inbox"),
      path: "/hosting/messages",
      icon: (active) => active ? <ChatIcon sx={{ fontSize: 24 }} /> : <ChatOutlinedIcon sx={{ fontSize: 24 }} />,
      onClick: () => navigate("/hosting/messages"),
    },
  ];

  return (
    <MotionBox
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.path);
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

export default MobileHostBottomNav;
