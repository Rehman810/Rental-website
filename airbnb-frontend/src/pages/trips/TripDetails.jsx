import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
    Stack,
    Chip,
    Avatar,
    Divider,
    Button,
    IconButton,
    Tooltip,
    Fade,
    useTheme,
    alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import toast from "react-hot-toast";

import { fetchDataById } from "../../config/ServiceApi/serviceApi";
import apiClient from "../../config/ServiceApi/apiClient";
import { API_BASE_URL } from "../../config/env";
import { getAuthToken } from "../../utils/cookieUtils";
import usePageTitle from "../../hooks/usePageTitle";
import { Dialog, DialogContent } from "@mui/material";
import Loader from "../../components/loader/loader";

const TripDetails = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [refundQuote, setRefundQuote] = useState({ amount: 0, reason: "" });

    usePageTitle(trip ? `Trip to ${trip.listingId?.city || "Destination"}` : "Trip Details");

    const calculateRefund = (tripData) => {
        if (!tripData.cancellationPolicy) return { amount: 0, reason: "Standard Policy" };
        const now = new Date();
        const bookingDate = new Date(tripData.createdAt);
        const checkIn = new Date(tripData.startDate);
        const amountPaid = tripData.totalPrice;
        const rules = tripData.cancellationPolicy.rules;

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

    const handleOpenCancel = () => {
        setRefundQuote(calculateRefund(trip));
        setCancelDialogOpen(true);
    };

    const handleConfirmCancel = async () => {
        try {
            await apiClient.post(`${API_BASE_URL}/bookings/${trip._id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Booking cancelled");
            setCancelDialogOpen(false);
            const updatedData = await fetchDataById("bookings", tripId);
            setTrip(updatedData.booking || updatedData.data || updatedData);
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to cancel");
        }
    };

    const handleContactHost = () => {
        if (trip?.hostData?._id || trip?.hostId) {
            navigate(`/user/guestMessages/${trip.hostData?._id || trip.hostId}`);
        } else {
            toast.error("Host information unavailable");
        }
    };

    useEffect(() => {
        const loadTripDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchDataById("bookings", tripId);
                setTrip(data.booking || data.data || data);
            } catch (error) {
                console.error("Failed to load trip details:", error);
                toast.error("Could not load trip details");
                navigate("/user/trips");
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            loadTripDetails();
        }
    }, [tripId, navigate]);

    if (loading) {
        return <Loader open={true} />;
    }

    if (!trip) {
        return null;
    }

    const listing = trip.listingId || {};
    const host = trip.hostData || {};

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const statusColors = {
        Active: theme.palette.success.main,
        Confirmed: theme.palette.success.main,
        Cancelled: theme.palette.error.main,
        CANCELLED: theme.palette.error.main,
        Completed: theme.palette.info.main,
        Pending: theme.palette.warning.main,
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <Box sx={{ pb: 8, pt: { xs: 3, md: 5 }, bgcolor: "var(--bg-secondary)", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                <Fade in timeout={800}>
                    <Box>
                        {/* Header Navigation */}
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                            <IconButton
                                onClick={() => navigate(-1)}
                                sx={{
                                    // bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    boxShadow: 2,
                                    backdropFilter: "blur(10px)",
                                    "&:hover": { bgcolor: "background.paper" }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: "-0.02em" }}>
                                    Trip Details
                                </Typography>
                                <Typography variant="body2" color="var(--text-secondary)" fontWeight={500}>
                                    Reservation details for your upcoming stay
                                </Typography>
                            </Box>
                        </Stack>

                        <Grid container spacing={4}>
                            {/* Left Column: Property & Itinerary */}
                            <Grid item xs={12} md={8}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 6,
                                        overflow: "hidden",
                                        border: "1px solid",
                                        borderColor: alpha(theme.palette.divider, 0.1),
                                        background: alpha(theme.palette.background.paper, 0.6),
                                        backdropFilter: "blur(20px)",
                                        mb: 4,
                                    }}
                                >
                                    {/* Hero Image */}
                                    <Box sx={{ height: { xs: 240, md: 400 }, position: "relative" }}>
                                        <img
                                            src={listing.photos?.[0] || "/fallback-image.jpg"}
                                            alt={listing.title}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))" }} />
                                        <Chip
                                            label={trip.status}
                                            sx={{
                                                position: "absolute",
                                                top: 24,
                                                right: 24,
                                                fontWeight: 900,
                                                bgcolor: alpha(statusColors[trip.status] || theme.palette.grey[500], 0.9),
                                                color: "#fff",
                                                backdropFilter: "blur(4px)",
                                                px: 1,
                                                borderRadius: 2,
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                                        <Typography variant="h3" fontWeight={950} sx={{ mb: 1, letterSpacing: "-0.03em" }}>
                                            {listing.title}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "var(--text-secondary)", mb: 4 }}>
                                            <LocationOnIcon fontSize="small" sx={{ color: "var(--primary-color)" }} />
                                            <Typography variant="h6" fontWeight={500}>
                                                {listing.address}, {listing.city}, {listing.country}
                                            </Typography>
                                        </Stack>

                                        <Divider sx={{ my: 4, opacity: 0.6 }} />

                                        {/* Itinerary Section */}
                                        <Box>
                                            <Typography variant="h5" fontWeight={900} gutterBottom sx={{ mb: 3 }}>
                                                Your Itinerary
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 5,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 2.5,
                                                            bgcolor: alpha(theme.palette.success.main, 0.03),
                                                            borderColor: alpha(theme.palette.success.main, 0.1),
                                                        }}
                                                    >
                                                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: "var(--primary-color)", width: 50, height: 50 }}>
                                                            <CheckCircleIcon fontSize="medium" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="caption" color="var(--text-secondary)" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>CHECK-IN</Typography>
                                                            <Typography variant="h6" fontWeight={900}>{startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Typography>
                                                            <Typography variant="body2" color="var(--text-secondary)" fontWeight={600}>After 3:00 PM</Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 5,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 2.5,
                                                            bgcolor: alpha(theme.palette.error.main, 0.03),
                                                            borderColor: alpha(theme.palette.error.main, 0.1),
                                                        }}
                                                    >
                                                        <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: "error.main", width: 50, height: 50 }}>
                                                            <AccessTimeIcon fontSize="medium" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="caption" color="var(--text-secondary)" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>CHECK-OUT</Typography>
                                                            <Typography variant="h6" fontWeight={900}>{endDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Typography>
                                                            <Typography variant="body2" color="var(--text-secondary)" fontWeight={600}>Before 11:00 AM</Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Paper>

                                {/* Rules Section */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 6,
                                        border: "1px solid",
                                        borderColor: alpha(theme.palette.divider, 0.1),
                                        background: alpha(theme.palette.background.paper, 0.6),
                                        backdropFilter: "blur(20px)",
                                    }}
                                >
                                    <Typography variant="h5" fontWeight={900} gutterBottom sx={{ mb: 2 }}>
                                        House Rules
                                    </Typography>
                                    <Typography variant="body1" color="var(--text-secondary)" sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                                        {listing.houseRules || "The host hasn't provided specific rules. Please treat the home with respect and enjoy your stay!"}
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* Right Column: Details & Actions */}
                            <Grid item xs={12} md={4}>
                                <Stack spacing={4}>
                                    {/* Confirmation Box */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: 6,
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette.divider, 0.1),
                                            background: "linear-gradient(135deg, rgba(255, 90, 95, 0.05), rgba(0,0,0,0.02))",
                                        }}
                                    >
                                        <Typography variant="caption" color="var(--text-secondary)" fontWeight={800} sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                            CONFIRMATION CODE
                                        </Typography>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: alpha(theme.palette.common.black, 0.05), p: 2, borderRadius: 4 }}>
                                            <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: 2, fontFamily: "monospace" }}>
                                                {trip._id.substring(0, 8).toUpperCase()}
                                            </Typography>
                                            <IconButton size="medium" onClick={() => copyToClipboard(trip._id)} sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Paper>

                                    {/* Price Details */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: 6,
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette.divider, 0.1),
                                            background: alpha(theme.palette.background.paper, 0.6),
                                            backdropFilter: "blur(20px)",
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight={900} gutterBottom sx={{ mb: 3 }}>
                                            Payment Details
                                        </Typography>

                                        <Stack spacing={2}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography color="var(--text-secondary)" fontWeight={600}>Rs {listing.price?.toLocaleString()} x {nights} nights</Typography>
                                                <Typography fontWeight={800}>Rs {(listing.price * nights).toLocaleString()}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography color="var(--text-secondary)" fontWeight={600}>Service Fee</Typography>
                                                <Typography fontWeight={800}>Rs 0</Typography>
                                            </Stack>
                                            <Divider sx={{ my: 1, borderStyle: "dashed" }} />
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="h6" fontWeight={950}>Total (PKR)</Typography>
                                                <Typography variant="h5" fontWeight={950} color="primary.main">Rs {trip.totalPrice?.toLocaleString()}</Typography>
                                            </Stack>
                                        </Stack>

                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 4, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 3, color: "success.main" }}>
                                            <PaymentsIcon />
                                            <Typography variant="body2" fontWeight={800}>
                                                Payment Confirmed via Card
                                            </Typography>
                                        </Stack>
                                    </Paper>

                                    {/* Host Info */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: 6,
                                            border: "1px solid",
                                            borderColor: alpha(theme.palette.divider, 0.1),
                                            background: alpha(theme.palette.background.paper, 0.6),
                                            backdropFilter: "blur(20px)",
                                        }}
                                    >
                                        <Stack direction="row" spacing={2.5} alignItems="center">
                                            <Box sx={{ position: "relative" }}>
                                                <Avatar
                                                    src={host.photoProfile}
                                                    alt={host.userName}
                                                    sx={{ width: 64, height: 64, border: `3px solid ${theme.palette.background.paper}`, boxShadow: theme.shadows[4] }}
                                                />
                                                <Box sx={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, bgcolor: "success.main", borderRadius: "50%", border: `2px solid ${theme.palette.background.paper}` }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="var(--text-secondary)" fontWeight={800} sx={{ textTransform: "uppercase" }}>HOSTED BY</Typography>
                                                <Typography variant="h5" fontWeight={950}>{host.userName || "Host"}</Typography>
                                            </Box>
                                        </Stack>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<SupportAgentIcon />}
                                            onClick={handleContactHost}
                                            sx={{
                                                mt: 4,
                                                borderRadius: 4,
                                                fontWeight: 900,
                                                textTransform: "none",
                                                py: 1.5,
                                                fontSize: "1rem",
                                                boxShadow: "none",
                                                "&:hover": { boxShadow: theme.shadows[4] }
                                            }}
                                        >
                                            Contact Host
                                        </Button>
                                    </Paper>

                                    {/* Cancel Action */}
                                    {trip.status !== "Cancelled" && trip.status !== "CANCELLED" && new Date(trip.startDate) > new Date() && (
                                        <Button
                                            fullWidth
                                            variant="text"
                                            color="error"
                                            onClick={handleOpenCancel}
                                            startIcon={<CancelIcon />}
                                            sx={{ borderRadius: 4, fontWeight: 800, textTransform: "none", py: 1 }}
                                        >
                                            Cancel Booking
                                        </Button>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>
            </Container>

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
                    <Box sx={{ width: 70, height: 70, borderRadius: "50%", bgcolor: alpha(theme.palette.error.main, 0.1), display: "flex", alignItems: "center", justifyContent: "center", color: "error.main", mx: "auto", mb: 3 }}>
                        <CancelIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={900} gutterBottom>Cancel Booking?</Typography>
                    <Typography color="var(--text-secondary)" sx={{ mb: 4, fontWeight: 500 }}>
                        Are you sure you want to cancel your stay at <span style={{ fontWeight: 800, color: theme.palette.text.primary }}>{listing.title}</span>?
                    </Typography>

                    <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.error.main, 0.03), borderRadius: 5, border: "1px dashed", borderColor: alpha(theme.palette.error.main, 0.2) }}>
                        <Typography variant="caption" display="block" color="var(--text-secondary)" fontWeight={800} sx={{ mb: 1, textTransform: "uppercase", letterSpacing: "0.1em" }}>Estimated Refund</Typography>
                        <Typography variant="h3" fontWeight={950} color={refundQuote && refundQuote.amount > 0 ? "success.main" : "var(--text-secondary)"}>
                            Rs {refundQuote?.amount?.toLocaleString() || 0}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ mt: 1, opacity: 0.8 }}>{refundQuote?.reason}</Typography>
                    </Paper>

                    <Stack direction="column" spacing={2}>
                        <Button variant="contained" color="error" onClick={handleConfirmCancel} fullWidth sx={{ borderRadius: 4, fontWeight: 900, py: 1.8, textTransform: "none", fontSize: "1rem" }}>
                            Confirm Cancellation
                        </Button>
                        <Button onClick={() => setCancelDialogOpen(false)} fullWidth sx={{ borderRadius: 4, fontWeight: 800, py: 1.5, color: "var(--text-secondary)", textTransform: "none" }}>
                            Keep My Booking
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TripDetails;

