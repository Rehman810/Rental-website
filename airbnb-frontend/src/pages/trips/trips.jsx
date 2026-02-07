import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Button,
  Container,
  Paper,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import Slider from "react-slick";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import StarIcon from "@mui/icons-material/Star";
import { fetchData } from "../../config/ServiceApi/serviceApi";
import toast from "react-hot-toast";
import LeaveReviewModal from "../../components/reviews/LeaveReviewModal";
import axios from 'axios';
import { API_BASE_URL } from "../../config/env";

import { getAuthToken } from "../../utils/cookieUtils";
import apiClient from "../../config/ServiceApi/apiClient";
import usePageTitle from "../../hooks/usePageTitle";
// ...
const Trips = () => {
  usePageTitle("Trips");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [activeTripIndex, setActiveTripIndex] = useState(null);

  const [trips, setTrips] = useState([]);
  const token = getAuthToken();

  const [userReviews, setUserReviews] = useState({});
  const [leaveReviewOpen, setLeaveReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const isMobile = useMediaQuery("(max-width:900px)");

  const fetchTrips = async () => {
    try {
      const response = await fetchData("guest-bookings");
      setTrips(response?.userBookings || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load trips");
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [token]);

  const settings = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 450,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4500,
      arrows: false,
    }),
    []
  );

  const handleImageClick = (index, tripIndex) => {
    setCurrentImageIndex(index);
    setActiveTripIndex(tripIndex);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setCurrentImageIndex(0);
    setActiveTripIndex(null);
  };

  const handleNextImage = () => {
    if (activeTripIndex === null) return;
    const total = trips?.[activeTripIndex]?.listingId?.photos?.length || 0;
    if (!total) return;
    setCurrentImageIndex((prev) => (prev + 1 < total ? prev + 1 : 0));
  };

  const handlePreviousImage = () => {
    if (activeTripIndex === null) return;
    const total = trips?.[activeTripIndex]?.listingId?.photos?.length || 0;
    if (!total) return;
    setCurrentImageIndex((prev) => (prev - 1 >= 0 ? prev - 1 : total - 1));
  };

  const handleOpenReviewModal = (trip) => {
    setSelectedBooking(trip);
    setLeaveReviewOpen(true);
  };

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [tripToCancel, setTripToCancel] = useState(null);
  const [refundQuote, setRefundQuote] = useState({ amount: 0, reason: '' });

  const calculateRefund = (trip) => {
    if (!trip.cancellationPolicy) return { amount: 0, reason: "Standard Policy" }; // Fallback
    const now = new Date();
    const bookingDate = new Date(trip.createdAt); // Ensure this is available
    const checkIn = new Date(trip.startDate);
    const amountPaid = trip.totalPrice;
    const rules = trip.cancellationPolicy.rules;

    if (!rules) return { amount: 0, reason: "Policy details unavailable" };

    const hoursSinceBooking = (now - bookingDate) / (1000 * 60 * 60);

    if (rules.fullRefundHours && hoursSinceBooking <= rules.fullRefundHours) {
      return { amount: amountPaid, reason: "Full refund (within grace period)" };
    }

    if (rules.noRefundAfterCheckIn && now >= checkIn) {
      return { amount: 0, reason: "No refund after check-in" };
    }

    const hoursBeforeCheckIn = (checkIn - now) / (1000 * 60 * 60);
    if (rules.partialRefundBeforeCheckIn && rules.partialRefundBeforeCheckIn.enabled) {
      if (hoursBeforeCheckIn >= rules.partialRefundBeforeCheckIn.hoursBeforeCheckIn) {
        const amt = Math.round((amountPaid * rules.partialRefundBeforeCheckIn.percentage) / 100);
        return { amount: amt, reason: `Partial refund (${rules.partialRefundBeforeCheckIn.percentage}%)` };
      }
    }

    // Default logic if not covered above (e.g. strict policy outside grace period)
    return { amount: 0, reason: "Cancellation period expired" };
  };


  const handleOpenCancel = (trip) => {
    setTripToCancel(trip);
    setRefundQuote(calculateRefund(trip));
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await apiClient.post(`${API_BASE_URL}/bookings/${tripToCancel._id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking cancelled");
      setCancelDialogOpen(false);
      fetchTrips();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(0,0,0,0.02))",
            mb: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Your Trips
              </Typography>
              <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
                {trips?.length ? `${trips.length} bookings found` : "Your bookings will appear here."}
              </Typography>
            </Box>

            <Chip
              label={`${trips?.length || 0} Trips`}
              variant="outlined"
              sx={{ borderRadius: 999, fontWeight: 900, color: "var(--text-secondary)" }}
            />
          </Stack>
        </Paper>

        {/* Trips Grid */}
        <Grid container spacing={2.2}>
          {trips?.length > 0 ? (
            trips.map((trip, tripIndex) => {
              const photos = trip?.listingId?.photos || [];
              const listing = trip?.listingId || {};
              const host = trip?.hostData || {};

              const statusColor =
                trip?.status === "Active" ? "success" : trip?.status === "Cancelled" ? "error" : "warning";

              const canReview = new Date(trip.endDate) < new Date() && trip.status !== "Cancelled";

              const amenities = Array.isArray(listing?.amenities) ? listing.amenities : [];
              const visibleAmenities = amenities.slice(0, 6);
              const remainingAmenities = amenities.length - visibleAmenities.length;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={trip?._id || tripIndex}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
                      },
                    }}
                  >
                    {/* Image Slider */}
                    <Box sx={{ position: "relative" }}>
                      <Slider {...settings}>
                        {photos.map((photo, index) => (
                          <Box
                            key={index}
                            onClick={() => handleImageClick(index, tripIndex)}
                            sx={{ height: 220, cursor: "pointer" }}
                          >
                            <img
                              src={photo}
                              alt={`Trip photo ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                            />
                          </Box>
                        ))}
                      </Slider>

                      {/* Status chip */}
                      <Chip
                        label={trip?.status || "Pending"}
                        color={statusColor}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          borderRadius: 999,
                          fontWeight: 900,
                          backdropFilter: "blur(10px)",
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      {/* Title + city */}
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography
                          fontWeight={900}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {listing?.title || "Stay"}
                        </Typography>

                        <Stack direction="row" spacing={0.4} alignItems="center">
                          <StarIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2" fontWeight={900}>
                            {listing?.averageRating || "New"}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="var(--text-secondary)"
                        sx={{
                          mt: 0.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {listing?.city ? `${listing.city}, Pakistan` : "Pakistan"}
                      </Typography>

                      {/* Description (short) */}
                      <Typography
                        variant="body2"
                        color="var(--text-secondary)"
                        sx={{
                          mt: 0.8,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 40,
                        }}
                      >
                        {listing?.description || "Comfortable stay with great amenities."}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Dates + Total */}
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarMonthIcon sx={{ fontSize: 18, color: "var(--text-secondary)" }} />
                          <Typography variant="body2" fontWeight={800}>
                            {new Date(trip.startDate).toLocaleDateString()} →{" "}
                            {new Date(trip.endDate).toLocaleDateString()}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <PaymentsIcon sx={{ fontSize: 18, color: "var(--text-secondary)" }} />
                          <Typography variant="body2" fontWeight={900}>
                            Total: Rs {trip?.totalPrice || 0}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Amenities */}
                      {visibleAmenities?.length > 0 && (
                        <Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ mt: 1.6 }}>
                          {visibleAmenities.map((a, idx) => (
                            <Chip
                              key={idx}
                              label={a}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 999, fontWeight: 800, mb: 0.6, color: "var(--text-secondary)" }}
                            />
                          ))}
                          {remainingAmenities > 0 && (
                            <Chip
                              label={`+${remainingAmenities} more`}
                              size="small"
                              sx={{ borderRadius: 999, fontWeight: 900, color: "var(--text-secondary)" }}
                            />
                          )}
                        </Stack>
                      )}

                      {/* Review CTA */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar
                            src={host?.photoProfile}
                            alt={host?.userName}
                            sx={{ width: 34, height: 34 }}
                          />
                          <Typography variant="body2" fontWeight={900}>
                            {host?.userName || "Host"}
                          </Typography>
                        </Stack>

                        {canReview && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenReviewModal(trip)}
                            sx={{
                              borderRadius: 999,
                              textTransform: "none",
                              fontWeight: 900,
                              px: 1.6,
                            }}
                          >
                            Give review
                          </Button>
                        )}

                        {trip.status !== 'Cancelled' && trip.status !== 'CANCELLED' && new Date(trip.startDate) > new Date() && (
                          <Button
                            variant="text"
                            size="small"
                            color="error"
                            onClick={() => handleOpenCancel(trip)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 900
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  textAlign: "center",
                  backgroundColor: "rgba(0,0,0,0.02)",
                }}
              >
                <Typography variant="h6" fontWeight={900}>
                  No trips available
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.6 }}>
                  Once you book a stay, it will show up here.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Review Modal */}
      <LeaveReviewModal
        open={leaveReviewOpen}
        onClose={() => setLeaveReviewOpen(false)}
        listingId={selectedBooking?.listingId?._id}
        bookingId={selectedBooking?._id}
        onReviewSubmitted={fetchTrips}
      />

      {/* Fullscreen Image Modal */}
      <Dialog fullScreen open={imageDialogOpen} onClose={handleCloseImageDialog}>
        <DialogContent
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.10)",
              borderRadius: 2,
            }}
            onClick={handleCloseImageDialog}
          >
            <CloseIcon />
          </IconButton>

          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: 16,
              color: "white",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255,255,255,0.10)",
              borderRadius: 2,
            }}
            onClick={handlePreviousImage}
          >
            <ArrowBackIcon />
          </IconButton>

          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              right: 16,
              color: "white",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255,255,255,0.10)",
              borderRadius: 2,
            }}
            onClick={handleNextImage}
          >
            <ArrowForwardIcon />
          </IconButton>

          <Box
            sx={{
              width: { xs: "92%", md: "70%" },
              maxHeight: "85vh",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <img
              src={trips?.[activeTripIndex]?.listingId?.photos?.[currentImageIndex] || "/fallback-image.jpg"}
              alt="Trip"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      < Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={800} gutterBottom>Cancel Booking?</Typography>
          <Typography color="text.secondary" paragraph variant="body2">
            Are you sure you want to cancel your stay at <b>{tripToCancel?.listingId?.title}</b>?
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3, borderStyle: 'dashed' }}>
            <Typography variant="caption" display="block" color="text.secondary" fontWeight={700} gutterBottom>ESTIMATED REFUND</Typography>
            <Typography variant="h4" fontWeight={900} color={refundQuote && refundQuote.amount > 0 ? "success.main" : "text.secondary"}>
              Rs {refundQuote?.amount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{refundQuote?.reason}</Typography>
          </Paper>

          <Stack direction="row" spacing={1} justifyContent="center" width="100%">
            <Button onClick={() => setCancelDialogOpen(false)} fullWidth sx={{ borderRadius: 999, fontWeight: 800, color: 'text.primary' }}>Keep Booking</Button>
            <Button variant="contained" color="error" onClick={handleConfirmCancel} fullWidth sx={{ borderRadius: 999, fontWeight: 800 }}>
              Confirm
            </Button>
          </Stack>
        </DialogContent>
      </Dialog >
    </Box >
  );
};

export default Trips;
