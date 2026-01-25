import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import useDocumentTitle from "../../hooks/dynamicTitle/dynamicTitle";
import CheckingOut from "../../components/checkingOut/checkingOut";
import CurrentlyHosting from "../../components/currentlyHosting/currentlyHosting";
import Upcoming from "../../components/upcoming/upcoming";
import PendingBooking from "../../components/pendingBooking/pendingBooking";
import { useBookingContext } from "../../context/booking";
import { APP_NAME } from "../../config/env";

const ReservationSection = () => {
  const [selectedTab, setSelectedTab] = useState("Pending Booking");
  useDocumentTitle("Host Dashboard - " + APP_NAME);

  const user = JSON.parse(localStorage.getItem("user"));
  const { checkingOut, pendingBooking, currentlyHosting, upcoming } =
    useBookingContext();

  const tabs = useMemo(
    () => [
      { label: "Pending Booking", count: pendingBooking || 0 },
      { label: "Checking out", count: checkingOut || 0 },
      { label: "Currently hosting", count: currentlyHosting || 0 },
      { label: "Upcoming", count: upcoming || 0 },
    ],
    [pendingBooking, checkingOut, currentlyHosting, upcoming]
  );

  const totalReservations = useMemo(() => {
    return (pendingBooking || 0) + (checkingOut || 0) + (currentlyHosting || 0) + (upcoming || 0);
  }, [pendingBooking, checkingOut, currentlyHosting, upcoming]);

  const renderContent = () => {
    switch (selectedTab) {
      case "Checking out":
        return <CheckingOut />;
      case "Currently hosting":
        return <CurrentlyHosting />;
      case "Upcoming":
        return <Upcoming />;
      case "Pending Booking":
        return <PendingBooking />;
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            No data available.
          </Typography>
        );
    }
  };

  const formatUserName = (userName = "") =>
    userName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
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
              Welcome, {formatUserName(user?.userName)} 👋
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage your bookings and stay on top of upcoming guests.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`Total: ${totalReservations}`}
              variant="outlined"
              sx={{
                borderRadius: 999,
                fontWeight: 900,
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
              onClick={() => setSelectedTab("Pending Booking")}
            >
              View reservations
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
            Your reservations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            Filter bookings by status to take quick actions.
          </Typography>
        </Box>

        <Button
          variant="text"
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 999,
            px: 2,
            color: "text.secondary",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          All reservations ({totalReservations})
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
                  color: active ? "white" : "text.secondary",
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
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(0,0,0,0.06)",
                    color: active ? "white" : "text.primary",
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
              label="Live"
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
    </Box>
  );
};

export default ReservationSection;
