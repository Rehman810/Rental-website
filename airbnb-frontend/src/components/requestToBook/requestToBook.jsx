import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Button,
  Card,
  CardMedia,
  CardContent,
  Paper,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { postDataById } from "../../config/ServiceApi/serviceApi";
import { useBookingContext } from "../../context/booking";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import toast from "react-hot-toast";

const BookingComponent = () => {
  const { bookListing, bookingData } = useBookingContext();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!stripe || !elements) return false;
    return true;
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleString("en-US", { month: "short" });
    const endMonth = end.toLocaleString("en-US", { month: "short" });

    if (startMonth === endMonth) return `${startDay} - ${endDay} ${startMonth}`;
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const missingPhone = !user?.phoneNumber;
  const missingPhoto = !user?.photoProfile;

  const total = useMemo(() => {
    return bookingData?.total ? Number(bookingData.total) : 0;
  }, [bookingData]);

  const handleReserve = async () => {
    if (!stripe || !elements) {
      toast.error("Payment gateway is still loading. Please wait...");
      return;
    }

    if (!user?.phoneNumber && !user?.photoProfile) {
      toast.error("Please add phone number & profile photo to continue.");
      return;
    }

    if (!user?.phoneNumber) {
      toast.error("Please add your phone number to continue.");
      return;
    }

    if (!user?.photoProfile) {
      toast.error("Please upload a profile photo to continue.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Processing your booking...");

    try {
      const data = {
        startDate: bookingData?.startDate,
        endDate: bookingData?.endDate,
        guestCapacity: bookingData?.guestCapacity,
      };

      const response = await postDataById("create-bookings", data, token, roomId);

      if (!response?.clientSecret) {
        toast.error("Unable to start payment. Please try again.", { id: toastId });
        return;
      }

      const { bookingMode, booking } = response;
      console.log(bookingMode, booking._id);

      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        response.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.userName || "Guest",
              email: user?.email,
            },
          },
        }
      );

      if (error) {
        toast.error(error.message || "Payment failed", { id: toastId });
        return;
      }

      const bookingId = booking._id;

      if (paymentIntent?.status === "requires_capture" || paymentIntent?.status === "succeeded") {

        if (bookingMode === 'instant') {
          // Instant Book: Capture and Confirm
          try {
            await postDataById(`confirm-booking`, {}, token, bookingId);
            toast.success("Payment successful! Booking confirmed 🎉", { id: toastId });
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } catch (confirmError) {
            toast.error("Payment authorized but confirmation failed. Please contact support.", { id: toastId });
          }

        } else {
          // Request to Book: Mark as Pending Approval
          try {
            await postDataById(`request-booking`, {}, token, bookingId);
            toast.success("Request sent to host. Waiting for approval.", { id: toastId });
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } catch (reqError) {
            toast.error("Payment authorized but request failed. Please contact support.", { id: toastId });
          }
        }
        return;
      }

      toast.error(`Payment status: ${paymentIntent?.status}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.2, md: 2.8 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.06), rgba(156,39,176,0.04))",
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={900}>
            {bookListing?.effectiveBookingMode === 'instant' ? "Confirm and Pay" : "Request to Book"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review your trip details and complete payment securely.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* LEFT */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2.5}>
            {/* Payment Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={900}>
                    Pay with card
                  </Typography>

                  <Chip
                    icon={<LockIcon />}
                    label="Secure checkout"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 800,
                      bgcolor: "rgba(46,125,50,0.10)",
                      color: "success.main",
                    }}
                  />
                </Stack>

                <Divider />

                <Box
                  sx={{
                    p: 1.6,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "rgba(0,0,0,0.02)",
                  }}
                >
                  <CardElement
                    options={{
                      hidePostalCode: true,
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#1f2937",
                          "::placeholder": { color: "#9ca3af" },
                        },
                        invalid: { color: "#b91c1c" },
                      },
                    }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Your card details are encrypted and processed by Stripe.
                </Typography>
              </Stack>
            </Paper>

            {/* Trip Details */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                Your trip
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoTile
                    icon={<CalendarMonthIcon />}
                    title="Dates"
                    value={formatDateRange(bookingData?.startDate, bookingData?.endDate)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoTile
                    icon={<GroupIcon />}
                    title="Guests"
                    value={`${bookingData?.guestCapacity || 0}`}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Requirements */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                Required for your trip
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                Complete these items before requesting a booking.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                {/* <RequirementRow
                  title="Message the host"
                  description="Introduce yourself and share a quick note about your trip."
                  actionLabel="Add"
                  onAction={() => { }}
                  status="required"
                /> */}

                <RequirementRow
                  title="Phone number"
                  description="Add and confirm your phone number to get trip updates."
                  actionLabel={missingPhone ? "Add" : "Completed"}
                  onAction={() => navigate("/user/profile")}
                  status={missingPhone ? "required" : "done"}
                />

                <RequirementRow
                  title="Profile photo"
                  description="Hosts want to know who’s staying at their place."
                  actionLabel={missingPhoto ? "Add" : "Completed"}
                  onAction={() => navigate("/user/profile")}
                  status={missingPhoto ? "required" : "done"}
                />
              </Stack>
            </Paper>

            {/* Policy */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <b>Cancellation policy:</b> This reservation is non-refundable.
              </Typography>
            </Paper>
          </Stack>
        </Grid>

        {/* RIGHT */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: "sticky", top: 110 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <CardMedia
                component="img"
                height="170"
                image={
                  bookListing?.photos?.[0] || "https://via.placeholder.com/300"
                }
                alt="Listing"
                sx={{ objectFit: "cover" }}
              />

              <Box sx={{ p: 2.3 }}>
                <Typography variant="subtitle1" fontWeight={900}>
                  {bookListing?.title || "Listing"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookListing?.roomType || ""}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <PriceRow
                    label={`For ${bookingData?.nights || 0} nights`}
                    value={`Rs ${bookingData?.priceForHouse || 0}`}
                  />
                  <PriceRow
                    label="Service fee"
                    value={`Rs ${bookingData?.serviceFee || 0}`}
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={900}>Total (PKR)</Typography>
                  <Typography fontWeight={900}>Rs {bookingData?.total || 0}</Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleReserve}
                  disabled={isLoading || missingPhone || missingPhoto}
                  endIcon={
                    isLoading ? null : <ArrowForwardIcon />
                  }
                  sx={{
                    py: 1.35,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 900,
                    boxShadow: "0 12px 30px rgba(25,118,210,0.25)",
                    "&:hover": {
                      transform: isLoading ? "none" : "translateY(-1px)",
                      boxShadow: isLoading
                        ? "0 12px 30px rgba(25,118,210,0.25)"
                        : "0 16px 35px rgba(25,118,210,0.35)",
                    },
                    transition: "all 0.18s ease",
                  }}
                >
                  {isLoading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} color="inherit" />
                      <span>Processing...</span>
                    </Stack>
                  ) : (
                    bookListing?.effectiveBookingMode === 'instant' ? "Confirm and Pay" : "Request to Book"
                  )}
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1.3, textAlign: "center", lineHeight: 1.6 }}
                >
                  {bookListing?.effectiveBookingMode === 'instant'
                    ? "Your booking will be confirmed immediately."
                    : <span><b>Your reservation won’t be confirmed</b> until the host accepts your request (within 24 hours). You won’t be charged until then.</span>
                  }
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

/* ------------------- Small UI Components ------------------- */

const InfoTile = ({ icon, title, value }) => {
  return (
    <Box
      sx={{
        p: 1.8,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255,255,255,0.55)",
        display: "flex",
        gap: 1.2,
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          backgroundColor: "rgba(25,118,210,0.10)",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={800}>
          {title}
        </Typography>
        <Typography fontWeight={900} sx={{ mt: 0.2 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

const RequirementRow = ({ title, description, actionLabel, onAction, status }) => {
  const isDone = status === "done";

  return (
    <Box
      sx={{
        p: 1.8,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.2, alignItems: "flex-start" }}>
        <Box sx={{ mt: 0.2 }}>
          {isDone ? (
            <CheckCircleIcon sx={{ color: "success.main" }} />
          ) : (
            <ErrorIcon sx={{ color: "warning.main" }} />
          )}
        </Box>

        <Box>
          <Typography fontWeight={900}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
            {description}
          </Typography>
        </Box>
      </Box>

      <Button
        variant={isDone ? "outlined" : "contained"}
        onClick={onAction}
        disabled={isDone}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 900,
          minWidth: 110,
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
};

const PriceRow = ({ label, value }) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={900}>
        {value}
      </Typography>
    </Stack>
  );
};

export default BookingComponent;
