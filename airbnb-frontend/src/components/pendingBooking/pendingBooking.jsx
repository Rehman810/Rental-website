import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Stack,
  Chip,
} from "@mui/material";
import {
  deleteDataById,
  fetchData,
  postDataById,
} from "../../config/ServiceApi/serviceApi";
import { showSuccessToast } from "../../components/toast/toast";
import { useBookingContext } from "../../context/booking";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";

const PendingBooking = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const token = localStorage.getItem("token");
  const { setPendingBooking } = useBookingContext();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetchData("temporary-booking", token);
      const list = response?.bookings || [];
      setPendingBookings(list);
      setPendingBooking(response?.count || list.length);
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
      setPendingBookings([]);
      setPendingBooking(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (bookingId) => {
    setProcessing(bookingId);
    try {
      await postDataById("confirm-booking", {}, token, bookingId);

      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setPendingBooking((prev) => Math.max(0, (prev || 0) - 1));

      toast.success("Booking accepted!");
    } catch (error) {
      console.error("Error accepting booking:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (bookingId) => {
    setProcessing(bookingId);
    try {
      await deleteDataById("reject-booking", token, bookingId);

      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setPendingBooking((prev) => Math.max(0, (prev || 0) - 1));

      toast.success("Booking rejected!");
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} fontWeight={900}>
          Loading pending bookings...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fetching latest requests.
        </Typography>
      </Box>
    );
  }

  if (!pendingBookings || pendingBookings.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          backgroundColor: "rgba(0,0,0,0.015)",
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 52, color: "text.secondary" }} />
        <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>
          No pending bookings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Nothing is waiting for approval right now.
        </Typography>

        <Button variant="outlined" sx={{ mt: 3 }} onClick={fetchBookings}>
          Refresh
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {pendingBookings.map((booking) => {
        const guest = booking?.userSpecificData;
        const listing = booking?.listingId;

        const isBusy = processing === booking._id;

        return (
          <Paper
            key={booking._id}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              backgroundColor: "white",
              transition: "0.2s ease",
              "&:hover": {
                boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Grid container>
              {/* LEFT: Listing Image */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 220, md: "100%" },
                    minHeight: { md: 220 },
                    backgroundColor: "rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={listing?.photos?.[0] || "https://via.placeholder.com/500"}
                    alt={listing?.title || "Listing"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                  />

                  <Chip
                    label="Pending"
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      borderRadius: 999,
                      fontWeight: 900,
                      backgroundColor: "rgba(0,0,0,0.70)",
                      color: "white",
                    }}
                  />
                </Box>
              </Grid>

              {/* RIGHT: Details */}
              <Grid item xs={12} md={8}>
                <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                  {/* Header */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        {listing?.title || "Reservation request"}
                      </Typography>

                      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.4 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {listing?.city || "Pakistan"}
                        </Typography>
                      </Stack>
                    </Box>

                    <Chip
                      icon={<PaymentsIcon />}
                      label={`Rs ${booking?.totalPrice || 0}`}
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 900,
                        px: 1,
                      }}
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    {/* Guest Info */}
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "rgba(0,0,0,0.015)",
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={guest?.photoProfile}
                            alt={guest?.name || "Guest"}
                            sx={{ width: 52, height: 52 }}
                          >
                            {guest?.name?.[0]?.toUpperCase() || "G"}
                          </Avatar>

                          <Box>
                            <Typography fontWeight={900}>
                              {guest?.name || "Guest"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Guests: {booking?.guestCapacity || 0}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Dates */}
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "rgba(0,0,0,0.015)",
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarMonthIcon sx={{ color: "text.secondary" }} />
                          <Typography fontWeight={900}>Dates</Typography>
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Check-in:{" "}
                          <strong>
                            {booking?.startDate
                              ? new Date(booking.startDate).toLocaleDateString()
                              : "N/A"}
                          </strong>
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Check-out:{" "}
                          <strong>
                            {booking?.endDate
                              ? new Date(booking.endDate).toLocaleDateString()
                              : "N/A"}
                          </strong>
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Actions */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="flex-end"
                    sx={{ mt: 2 }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={
                        isBusy ? (
                          <CircularProgress size={18} sx={{ color: "white" }} />
                        ) : (
                          <CheckCircleIcon />
                        )
                      }
                      disabled={isBusy}
                      onClick={() => handleAccept(booking._id)}
                      sx={{
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 900,
                        px: 2.5,
                        py: 1,
                      }}
                    >
                      {isBusy ? "Accepting..." : "Accept"}
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={isBusy ? null : <CloseIcon />}
                      disabled={isBusy}
                      onClick={() => handleReject(booking._id)}
                      sx={{
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 900,
                        px: 2.5,
                        py: 1,
                      }}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default PendingBooking;
