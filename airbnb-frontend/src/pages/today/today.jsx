import React, { useEffect, useMemo, useState } from "react";
import { getAuthToken, getAuthUser } from "../../utils/cookieUtils";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import usePageTitle from "../../hooks/usePageTitle";
import CheckingOut from "../../components/checkingOut/checkingOut";
import CurrentlyHosting from "../../components/currentlyHosting/currentlyHosting";
import Upcoming from "../../components/upcoming/upcoming";
import PendingBooking from "../../components/pendingBooking/pendingBooking";
import { useBookingContext } from "../../context/booking";
import ConfirmedBookings from "../../components/confirmedBookings/confirmedBookings";
import { fetchData } from "../../config/ServiceApi/serviceApi";

import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../../components/language/Localization";

const ReservationSection = () => {
  const { t } = useTranslation("translation");
  const [selectedTab, setSelectedTab] = useState(t("hosting.tabs.pending"));
  usePageTitle(t("hosting.dashboard.pageTitle"));

  const user = getAuthUser();
  const {
    checkingOut,
    pendingBooking,
    currentlyHosting,
    upcoming,
    confirmedBookings,
    setPendingBooking,
    setCheckingOut,
    setCurrentlyHosting,
    setUpcoming,
    setConfirmedBookings,
  } = useBookingContext();

  const tabs = useMemo(
    () => [
      { label: t("hosting.tabs.pending"), key: "Pending Booking", count: pendingBooking || 0 },
      { label: t("hosting.tabs.confirmed"), key: "Confirmed Bookings", count: confirmedBookings || 0 },
      { label: t("hosting.tabs.checkingOut"), key: "Checking out", count: checkingOut || 0 },
      { label: t("hosting.tabs.currentlyHosting"), key: "Currently hosting", count: currentlyHosting || 0 },
      { label: t("hosting.tabs.upcoming"), key: "Upcoming", count: upcoming || 0 },
    ],
    [t, pendingBooking, confirmedBookings, checkingOut, currentlyHosting, upcoming]
  );

  const totalReservations = useMemo(() => {
    return (pendingBooking || 0) + (confirmedBookings || 0) + (checkingOut || 0) + (currentlyHosting || 0) + (upcoming || 0);
  }, [pendingBooking, confirmedBookings, checkingOut, currentlyHosting, upcoming]);

  const renderContent = () => {
    const activeTab = tabs.find(tab => tab.label === selectedTab);
    const tabKey = activeTab ? activeTab.key : selectedTab;

    switch (tabKey) {
      case "Checking out":
        return <CheckingOut />;
      case "Confirmed Bookings":
        return <ConfirmedBookings />;
      case "Currently hosting":
        return <CurrentlyHosting />;
      case "Upcoming":
        return <Upcoming />;
      case "Pending Booking":
        return <PendingBooking />;
      default:
        return (
          <Typography variant="body2" color="var(--text-secondary)">
            {t("hosting.dashboard.noData")}
          </Typography>
        );
    }
  };

  const formatUserName = (userName = "") =>
    userName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  useEffect(() => {
    const token = getAuthToken();

    const fetchAllCounts = async () => {
      try {
        const [
          pendingRes,
          checkingOutRes,
          hostingRes,
          upcomingRes,
          confirmedRes,
        ] = await Promise.all([
          fetchData("temporary-booking"),
          fetchData("bookings-checking-out-today"),
          fetchData("currently-hosting"),
          fetchData("upcoming-bookings"),
          fetchData("get-confirmed-booking"),
        ]);

        const pendingList = pendingRes?.bookings || [];
        const pendingApproval = pendingList.filter(
          (b) => b.status === "pending_approval"
        );

        setPendingBooking(pendingRes?.count ?? pendingApproval.length);
        setCheckingOut(checkingOutRes?.count ?? (checkingOutRes?.bookingsCheckingOutToday?.length || 0));
        setCurrentlyHosting(hostingRes?.count ?? (hostingRes?.currentlyHostingBookings?.length || 0));
        setUpcoming(upcomingRes?.count ?? (upcomingRes?.upcomingBookings?.length || 0));
        setConfirmedBookings(confirmedRes?.count ?? (confirmedRes?.bookings?.length || 0));
      } catch (err) {
        console.error("Counts fetch error:", err);
      }
    };

    fetchAllCounts();
  }, [
    setPendingBooking,
    setCheckingOut,
    setCurrentlyHosting,
    setUpcoming,
    setConfirmedBookings
  ]);

  const isRTL = useRTL();

  return (
    <RTLWrapper sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(225,29,72,0.06))",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={900}>
              {t("hosting.today.welcome", { name: formatUserName(user?.userName) })}
            </Typography>
            <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 1 }}>
              {t("hosting.dashboard.account")}
            </Typography>
            <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
              {t("hosting.today.manageBookings")}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${t("hosting.today.total")}: ${totalReservations}`}
              variant="outlined"
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                bgcolor: "transparent",
                borderColor: "var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
            <Button
              variant="contained"
              sx={{
                borderRadius: 999,
                px: 2.5,
                py: 1,
                fontWeight: 900,
                textTransform: "none",
                boxShadow: "0 14px 35px rgba(0,0,0,0.15)",
              }}
              onClick={() => setSelectedTab(t("hosting.tabs.pending"))}
            >
              {t("hosting.today.viewReservations")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Section Title */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mt: 3 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            {t("hosting.today.yourReservations")}
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 1 }}>
            {t("hosting.dashboard.navigation")}
          </Typography>
        </Box>

        <Button
          variant="text"
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 999,
            px: 2,
            color: "var(--text-secondary)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          {t("hosting.today.allReservations")} ({totalReservations})
        </Button>
      </Stack>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 1,
          borderRadius: 999,
          border: "1px solid",
          borderColor: "divider",
          overflowX: "auto",
          backgroundColor: "white",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ minWidth: "max-content" }}>
          {tabs.map((tab) => {
            const active = selectedTab === tab.label;
            return (
              <Button
                key={tab.label}
                onClick={() => setSelectedTab(tab.label)}
                variant={active ? "contained" : "text"}
                sx={{
                  borderRadius: 999,
                  px: 2,
                  py: 1,
                  fontWeight: 900,
                  textTransform: "none",
                  backgroundColor: active ? "text.primary" : "transparent",
                  color: active ? "white" : "var(--text-secondary)",
                  "&:hover": {
                    backgroundColor: active
                      ? "text.primary"
                      : "rgba(0,0,0,0.05)",
                  },
                  boxShadow: active ? "0 12px 30px rgba(0,0,0,0.18)" : "none",
                }}
              >
                {tab.label}
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1.2,
                    py: 0.35,
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    backgroundColor: active
                      ? "var(--primary-color)"
                      : "var(--border-light)",
                    color: active ? "white" : "var(--text-primary)",
                    [isRTL ? "mr" : "ml"]: 1,
                  }}
                >
                  {tab.count}
                </Box>
              </Button>
            );
          })}
        </Stack>
      </Paper>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={900}>
              {selectedTab}
            </Typography>

            <Chip
              label={t("hosting.today.live")}
              size="small"
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                backgroundColor: "rgba(46,125,50,0.10)",
                color: "success.main",
              }}
            />
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: "rgba(0,0,0,0.015)" }}>
          {renderContent()}
        </Box>
      </Paper>
    </RTLWrapper>
  );
};

export default ReservationSection;
