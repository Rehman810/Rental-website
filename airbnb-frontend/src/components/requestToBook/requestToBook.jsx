import React, { useEffect, useMemo, useState } from "react";
import { getAuthToken, getAuthUser } from "../../utils/cookieUtils";
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
import { postDataById, fetchDataById } from "../../config/ServiceApi/serviceApi";
import { useBookingContext } from "../../context/booking";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import toast from "react-hot-toast";
import { CURRENCY } from "../../config/env";
import usePageTitle from "../../hooks/usePageTitle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BackButton from "../backButton/backButton";
import { useTranslation } from "react-i18next";
import { RTLWrapper } from "../language/Localization";

const BookingComponent = () => {
  const { t } = useTranslation();
  usePageTitle(t("booking.requestToBook"));
  const { bookListing, bookingData, setBookListing, setBookingData, resetBookingState } = useBookingContext();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const token = getAuthToken();
  const user = getAuthUser();

  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [fetchingListing, setFetchingListing] = useState(false);

  useEffect(() => {
    const fetchListingData = async () => {
      if (!roomId) return;
      if (bookListing?._id === roomId) return;

      setFetchingListing(true);
      try {
        const response = await fetchDataById("listing", roomId);
        if (response?.listing) {
          setBookListing(response.listing);
        }
      } catch (error) {
        console.error("Failed to fetch listing:", error);
        toast.error("Could not load listing details.");
      } finally {
        setFetchingListing(false);
      }
    };

    fetchListingData();
  }, [roomId, bookListing?._id, setBookListing]);

  useEffect(() => {
    if (!bookingData || !bookingData.startDate || !bookingData.endDate) {
      if (!fetchingListing) {
        toast.error("Booking session expired. Please select dates again.");
        navigate(`/room/${roomId}`);
      }
    }
  }, [bookingData, roomId, navigate, fetchingListing]);

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

    setIsLoading(true);
    const toastId = toast.loading("Processing your booking...");

    try {
      const data = {
        startDate: bookingData?.startDate,
        endDate: bookingData?.endDate,
        guestCapacity: bookingData?.guestCapacity,
      };

      const response = await postDataById("create-bookings", data, roomId);

      if (!response?.clientSecret) {
        toast.error("Unable to start payment. Please try again.", { id: toastId });
        return;
      }

      const { bookingMode, booking } = response;
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
          await postDataById(`confirm-booking`, {}, bookingId);
          toast.success("Payment successful! Booking confirmed 🎉", { id: toastId });
          resetBookingState();
          setTimeout(() => navigate("/"), 2000);
        } else {
          await postDataById(`request-booking`, {}, bookingId);
          toast.success("Request sent to host. Waiting for approval.", { id: toastId });
          resetBookingState();
          setTimeout(() => navigate("/"), 2000);
        }
        return;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const getCancellationName = (policy) => {
    return policy?.name || "Flexible";
  };

  const getCancellationDescription = (policy) => {
    if (!policy) return "Free cancellation for a limited time.";
    return policy.description || "Cancellation policy applies.";
  };

  if (fetchingListing && (!bookListing || Object.keys(bookListing).length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <RTLWrapper sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <BackButton />
      </Box>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.2, md: 2.8 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
          background: "linear-gradient(135deg, rgba(25,118,210,0.06), rgba(156,39,176,0.04))",
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={900}>
            {bookListing?.effectiveBookingMode === 'instant' ? t("booking:confirmAndPay") : t("booking:requestToBook")}
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)">
            {t("booking:reviewDetails")}
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack spacing={2.5}>
            {/* Payment */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={900}>{t("booking:payWithCard")}</Typography>
                  <Chip icon={<LockIcon />} label={t("booking:secureCheckout")} size="small" sx={{ fontWeight: 800, bgcolor: "rgba(46,125,50,0.1)", color: "success.main" }} />
                </Stack>
                <Divider />
                <Box sx={{ p: 1.6, borderRadius: 2, border: "1px solid", borderColor: "divider", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: "16px", color: "var(--text-primary)" } } }} />
                </Box>
              </Stack>
            </Paper>

            {/* Trip Details */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" fontWeight={900}>{t("booking:yourTrip")}</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoTile icon={<CalendarMonthIcon />} title={t("common:checkIn")} value={formatDateRange(bookingData?.startDate, bookingData?.endDate)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoTile icon={<GroupIcon />} title={t("common:guests")} value={`${bookingData?.guestCapacity || 0}`} />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ position: "sticky", top: 110 }}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <CardMedia component="img" height="170" image={bookListing?.photos?.[0] || "https://via.placeholder.com/300"} sx={{ objectFit: "cover" }} />
              <Box sx={{ p: 2.3 }}>
                <Typography variant="subtitle1" fontWeight={900}>{bookListing?.title}</Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <PriceRow label={t("booking:forNights", { count: bookingData?.nights || 0 })} value={`Rs ${bookingData?.priceForHouse || 0}`} />
                  <PriceRow label={t("booking:serviceFee")} value={`Rs ${bookingData?.serviceFee || 0}`} />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={900}>{t("booking:total")} ({CURRENCY})</Typography>
                  <Typography fontWeight={900}>{CURRENCY} {bookingData?.total || 0}</Typography>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleReserve}
                  disabled={isLoading}
                  sx={{ py: 1.35, borderRadius: 2, textTransform: "none", fontWeight: 900 }}
                >
                  {isLoading ? t("booking:payNow") + "..." : (bookListing?.effectiveBookingMode === "instant" ? t("booking:confirmAndPay") : t("booking:requestToBook"))}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </RTLWrapper>
  );
};

const InfoTile = ({ icon, title, value }) => (
  <Box sx={{ p: 1.8, borderRadius: 2.5, border: "1px solid", borderColor: "divider", backgroundColor: "var(--bg-secondary)", display: "flex", gap: 1.2, alignItems: "flex-start" }}>
    <Box sx={{ width: 38, height: 38, borderRadius: 2, display: "grid", placeItems: "center", backgroundColor: "rgba(25,118,210,0.1)", color: "primary.main", flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="var(--text-secondary)" fontWeight={800}>{title}</Typography>
      <Typography fontWeight={900}>{value}</Typography>
    </Box>
  </Box>
);

const PriceRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" color="var(--text-secondary)">{label}</Typography>
    <Typography variant="body2" fontWeight={900}>{value}</Typography>
  </Stack>
);

export default BookingComponent;
