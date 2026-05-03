import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Skeleton,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import Slider from "react-slick";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { fetchData } from "../../config/ServiceApi/serviceApi";
import toast from "react-hot-toast";
import LeaveReviewModal from "../../components/reviews/LeaveReviewModal";
import { API_BASE_URL } from "../../config/env";
import { getAuthToken } from "../../utils/cookieUtils";
import apiClient from "../../config/ServiceApi/apiClient";
import usePageTitle from "../../hooks/usePageTitle";
import BackButton from "../../components/backButton/backButton";
import Amenities from "../../components/amenities/amenities";

const Trips = () => {
  usePageTitle("Your Trips");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [activeTripIndex, setActiveTripIndex] = useState(null);

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [leaveReviewOpen, setLeaveReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [tripToCancel, setTripToCancel] = useState(null);
  const [refundQuote, setRefundQuote] = useState({ amount: 0, reason: "" });

  const token = getAuthToken();

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const response = await fetchData("guest-bookings");
      setTrips(response?.userBookings || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load trips");
    } finally {
      setLoadingTrips(false);
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

  const handleImageClick = (e, index, tripIndex) => {
    e.stopPropagation();
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

  const handleOpenReviewModal = (e, trip) => {
    e.stopPropagation();
    setSelectedBooking(trip);
    setLeaveReviewOpen(true);
  };

  const calculateRefund = (trip) => {
    if (!trip.cancellationPolicy) return { amount: 0, reason: "Standard Policy" };
    const now = new Date();
    const bookingDate = new Date(trip.createdAt);
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

    return { amount: 0, reason: "Cancellation period expired" };
  };

  const handleOpenCancel = (e, trip) => {
    e.stopPropagation();
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
    <Box sx={{ py: { xs: 3, md: 5 }, minHeight: "100vh", position: "relative" }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <BackButton />
        </Box>

        {/* Header Section */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 5,
              position: "relative",
              overflow: "hidden",
              border: "1px solid",
              borderColor: alpha(theme.palette.divider, 0.1),
              background: "linear-gradient(135deg, rgba(255, 90, 95, 0.08), rgba(0, 0, 0, 0.02))",
              backdropFilter: "blur(10px)",
              mb: 5,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                fontWeight={900}
                sx={{
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(to right, #FF5A5F, #FF8A8F)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Your Trips
              </Typography>
              <Typography variant="body1" color="var(--text-secondary)" sx={{ mt: 1, fontWeight: 500 }}>
                {trips?.length
                  ? `You have ${trips.length} upcoming or past bookings.`
                  : "Your bookings will appear here."}
              </Typography>
            </Box>

            <Chip
              label={`${trips?.length || 0} Total Trips`}
              sx={{
                borderRadius: 4,
                fontWeight: 800,
                fontSize: "0.95rem",
                px: 2,
                py: 2.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            />
          </Paper>
        </Fade>

        <Grid container spacing={4}>
          {loadingTrips ? (
            [...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <Skeleton variant="rounded" height={450} sx={{ borderRadius: 5 }} />
              </Grid>
            ))
          ) : trips.length > 0 ? (
            trips.map((trip, tripIndex) => {
              const photos = trip?.listingId?.photos || [];
              const listing = trip?.listingId || {};
              const host = trip?.hostData || {};
              const statusColor =
                trip?.status === "Active" || trip?.status === "Confirmed"
                  ? theme.palette.success.main
                  : trip?.status === "Cancelled"
                    ? theme.palette.error.main
                    : theme.palette.warning.main;

              const canReview = new Date(trip.endDate) < new Date() && trip.status !== "Cancelled";
              const amenitiesArray = Array.isArray(listing?.amenities) ? listing.amenities : [];

              return (
                <Grid item xs={12} sm={6} lg={4} key={trip?._id || tripIndex}>
                  <Fade in timeout={500 + tripIndex * 100}>
                    <Card
                      elevation={0}
                      onClick={() => navigate(`/user/trips/${trip._id}`)}
                      sx={{
                        height: "100%",
                        cursor: "pointer",
                        borderRadius: 6,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.divider, 0.1),
                        background: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: "blur(20px)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                      }}
                    >
                      {/* Image Slider Section */}
                      <Box sx={{ position: "relative", height: 260 }}>
                        <Slider {...settings}>
                          {photos.map((photo, index) => (
                            <Box
                              key={index}
                              onClick={(e) => handleImageClick(e, index, tripIndex)}
                              sx={{ height: 260, position: "relative" }}
                            >
                              <img
                                src={photo}
                                alt={`Trip ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6))",
                                }}
                              />
                            </Box>
                          ))}
                        </Slider>

                        {/* Status Overlay */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 16,
                            left: 16,
                            zIndex: 2,
                          }}
                        >
                          <Chip
                            label={trip?.status || "Pending"}
                            sx={{
                              bgcolor: alpha(statusColor, 0.9),
                              color: "#fff",
                              fontWeight: 900,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderRadius: 2,
                              backdropFilter: "blur(4px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }}
                          />
                        </Box>

                        {/* Price Overlay */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 16,
                            right: 16,
                            zIndex: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={900}
                            sx={{
                              color: "#fff",
                              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                            }}
                          >
                            Rs {trip?.totalPrice?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Box>

                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                          {/* Title & Rating */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                fontWeight={900}
                                sx={{
                                  lineHeight: 1.2,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {listing?.title || "Stay"}
                              </Typography>
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 14, color: "var(--text-secondary)" }} />
                                <Typography variant="caption" color="var(--text-secondary)" fontWeight={600}>
                                  {listing?.city ? `${listing.city}, Pakistan` : "Pakistan"}
                                </Typography>
                              </Stack>
                            </Box>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                px: 1,
                                py: 0.5,
                                borderRadius: 2,
                              }}
                            >
                              <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                              <Typography variant="body2" fontWeight={900} color="warning.main">
                                {listing?.averageRating || "New"}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Date Info */}
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 4,
                              bgcolor: alpha(theme.palette.action.hover, 0.05),
                              borderColor: alpha(theme.palette.divider, 0.05),
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.palette.primary.main,
                              }}
                            >
                              <CalendarMonthIcon />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="var(--text-secondary)" fontWeight={700} sx={{ display: "block", textTransform: "uppercase" }}>
                                Stay Period
                              </Typography>
                              <Typography variant="body2" fontWeight={800}>
                                {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </Typography>
                            </Box>
                          </Paper>

                          {/* Amenities */}
                          <Box sx={{ minHeight: 45 }}>
                            <Amenities backendAmenities={amenitiesArray} variant="chip" limit={isMobile ? 3 : 4} />
                          </Box>

                          <Divider sx={{ opacity: 0.6 }} />

                          {/* Footer: Host & Actions */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (host?.hostId) navigate(`/profile/host/${host.hostId}`);
                              }}
                              sx={{
                                cursor: "pointer",
                                "&:hover img": { transform: "scale(1.1)" },
                              }}
                            >
                              <Box sx={{ position: "relative" }}>
                                <Avatar
                                  src={host?.photoProfile}
                                  alt={host?.userName}
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    border: `2px solid ${theme.palette.background.paper}`,
                                    boxShadow: theme.shadows[2],
                                    transition: "transform 0.2s ease",
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    width: 12,
                                    height: 12,
                                    bgcolor: "success.main",
                                    borderRadius: "50%",
                                    border: `2px solid ${theme.palette.background.paper}`,
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography variant="caption" color="var(--text-secondary)" fontWeight={600}>
                                  Hosted by
                                </Typography>
                                <Typography variant="body2" fontWeight={900}>
                                  {host?.userName || "Host"}
                                </Typography>
                              </Box>
                            </Stack>

                            <Stack direction="row" spacing={1}>
                              {canReview && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={(e) => handleOpenReviewModal(e, trip)}
                                  sx={{
                                    borderRadius: 3,
                                    textTransform: "none",
                                    fontWeight: 800,
                                    boxShadow: "none",
                                    px: 2,
                                  }}
                                >
                                  Review
                                </Button>
                              )}

                              {trip.status !== "Cancelled" &&
                                trip.status !== "CANCELLED" &&
                                new Date(trip.startDate) > new Date() && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => handleOpenCancel(e, trip)}
                                    sx={{
                                      bgcolor: alpha(theme.palette.error.main, 0.05),
                                      "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
                                    }}
                                  >
                                    <CloseIcon sx={{ fontSize: 20 }} />
                                  </IconButton>
                                )}
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Fade in timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 6, md: 10 },
                    borderRadius: 8,
                    textAlign: "center",
                    border: "2px dashed",
                    borderColor: alpha(theme.palette.divider, 0.1),
                    background: alpha(theme.palette.background.paper, 0.4),
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 4,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.primary.main,
                    }}
                  >
                    <CalendarMonthIcon sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography variant="h4" fontWeight={900} gutterBottom>
                    No trips booked yet
                  </Typography>
                  <Typography variant="body1" color="var(--text-secondary)" sx={{ maxWidth: 400, mx: "auto", mb: 4 }}>
                    When you're ready to start your next adventure, your bookings will be waiting for you here.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/")}
                    sx={{
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      fontWeight: 900,
                      textTransform: "none",
                      fontSize: "1.1rem",
                    }}
                  >
                    Explore Listings
                  </Button>
                </Paper>
              </Fade>
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
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            p: 0,
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              zIndex: 10,
            }}
            onClick={handleCloseImageDialog}
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          <IconButton
            sx={{
              position: "absolute",
              left: 24,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
            onClick={handlePreviousImage}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>

          <IconButton
            sx={{
              position: "absolute",
              right: 24,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
            onClick={handleNextImage}
          >
            <ArrowForwardIcon fontSize="large" />
          </IconButton>

          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={trips?.[activeTripIndex]?.listingId?.photos?.[currentImageIndex] || "/fallback-image.jpg"}
              alt="Trip Fullscreen"
              style={{ maxWidth: "95vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 6, p: 1 }
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.error.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "error.main",
              mx: "auto",
              mb: 3,
            }}
          >
            <CloseIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h5" fontWeight={900} gutterBottom>
            Cancel Booking?
          </Typography>
          <Typography color="var(--text-secondary)" sx={{ mb: 4, fontWeight: 500 }}>
            Are you sure you want to cancel your stay at{" "}
            <span style={{ fontWeight: 800, color: theme.palette.text.primary }}>
              {tripToCancel?.listingId?.title}
            </span>?
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 4,
              bgcolor: alpha(theme.palette.error.main, 0.03),
              borderRadius: 5,
              border: "1px dashed",
              borderColor: alpha(theme.palette.error.main, 0.2),
            }}
          >
            <Typography variant="caption" display="block" color="var(--text-secondary)" fontWeight={800} sx={{ mb: 1, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Estimated Refund
            </Typography>
            <Typography
              variant="h3"
              fontWeight={950}
              color={refundQuote && refundQuote.amount > 0 ? "success.main" : "var(--text-secondary)"}
            >
              Rs {refundQuote?.amount?.toLocaleString() || 0}
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ mt: 1, opacity: 0.8 }}>
              {refundQuote?.reason}
            </Typography>
          </Paper>

          <Stack direction="column" spacing={2}>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmCancel}
              fullWidth
              sx={{
                borderRadius: 4,
                fontWeight: 900,
                py: 1.8,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Confirm Cancellation
            </Button>
            <Button
              onClick={() => setCancelDialogOpen(false)}
              fullWidth
              sx={{
                borderRadius: 4,
                fontWeight: 800,
                py: 1.5,
                color: "var(--text-secondary)",
                textTransform: "none",
              }}
            >
              Keep My Booking
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Trips;

