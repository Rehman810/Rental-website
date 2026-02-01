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

const Trips = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [activeTripIndex, setActiveTripIndex] = useState(null);

  const [trips, setTrips] = useState([]);
  const token = localStorage.getItem("token");

  const [userReviews, setUserReviews] = useState({});
  const [leaveReviewOpen, setLeaveReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const isMobile = useMediaQuery("(max-width:900px)");

  const fetchTrips = async () => {
    try {
      const response = await fetchData("guest-bookings", token);
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
              sx={{ borderRadius: 999, fontWeight: 900 }}
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
                              sx={{ borderRadius: 999, fontWeight: 800, mb: 0.6 }}
                            />
                          ))}
                          {remainingAmenities > 0 && (
                            <Chip
                              label={`+${remainingAmenities} more`}
                              size="small"
                              sx={{ borderRadius: 999, fontWeight: 900 }}
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
    </Box>
  );
};

export default Trips;
