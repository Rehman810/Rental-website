
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

const containerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
};

const TripDetails = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [refundQuote, setRefundQuote] = useState({ amount: 0, reason: '' });

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
            // Refresh logic
            const updatedData = await fetchDataById("bookings", tripId);
            setTrip(updatedData.booking || updatedData.data || updatedData);
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to cancel");
        }
    };

    const handleContactHost = () => {
        if (trip?.hostData?._id) {
            navigate(`/user/guestMessages/${trip.hostData._id}`);
        } else {
            toast.error("Host information unavailable");
        }
    };

    useEffect(() => {
        const loadTripDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchDataById("bookings", tripId);
                // Handle various response structures
                setTrip(data.booking || data.data || data);
            } catch (error) {
                console.error("Failed to load trip details:", error);
                toast.error("Could not load trip details");
                navigate("/user/trips"); // Fallback
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
        return null; // or empty state handled by navigate
    }

    const listing = trip.listingId || {};
    const host = trip.hostData || {}; // Assuming hostData is populated, based on Trips list
    // Note: if fetching by ID doesn't populate hostData, we might need to fetch the listing/host separately.
    // Assuming the backend populates it similarly to the list endpoint.

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const statusColors = {
        Active: "success",
        Cancelled: "error",
        Completed: "info",
        Pending: "warning",
        "Pending Approval": "warning",
        "Pending Payment": "warning",
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <Box sx={{ pb: 8, pt: { xs: 2, md: 4 }, bgcolor: "var(--bg-color)", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                {/* Navigation Bar */}
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: "white", boxShadow: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight={800}>
                        Trip Details
                    </Typography>
                </Stack>

                <Grid container spacing={3}>
                    {/* Left Column: Main Info */}
                    <Grid item xs={12} md={8}>
                        {/* Hero Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 0,
                                borderRadius: 4,
                                overflow: "hidden",
                                border: "1px solid",
                                borderColor: "divider",
                                mb: 3,
                            }}
                        >
                            <Box sx={{ height: { xs: 200, md: 350 }, position: "relative" }}>
                                <img
                                    src={listing.photos?.[0] || "/fallback-image.jpg"}
                                    alt={listing.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <Chip
                                    label={trip.status}
                                    color={statusColors[trip.status] || "default"}
                                    sx={{
                                        position: "absolute",
                                        top: 20,
                                        right: 20,
                                        fontWeight: 900,
                                        backdropFilter: "blur(10px)",
                                        boxShadow: 2,
                                    }}
                                />
                            </Box>

                            <Box sx={{ p: 4 }}>
                                <Typography variant="h4" fontWeight={900} gutterBottom>
                                    {listing.title}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "var(--text-color)", mb: 2 }}>
                                    <LocationOnIcon fontSize="small" />
                                    <Typography variant="body1">
                                        {listing.address}, {listing.city}, {listing.country}
                                    </Typography>
                                </Stack>

                                <Divider sx={{ my: 3 }} />

                                {/* Timeline */}
                                <Box>
                                    <Typography variant="h6" fontWeight={800} gutterBottom>
                                        Your Itinerary
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                                                    <CheckCircleIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="var(--text-color)" fontWeight={700}>CHECK-IN</Typography>
                                                    <Typography variant="subtitle1" fontWeight={800}>{startDate.toLocaleDateString()}</Typography>
                                                    <Typography variant="body2" color="var(--text-color)">After 3:00 PM</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                                                    <AccessTimeIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="var(--text-color)" fontWeight={700}>CHECK-OUT</Typography>
                                                    <Typography variant="subtitle1" fontWeight={800}>{endDate.toLocaleDateString()}</Typography>
                                                    <Typography variant="body2" color="var(--text-color)">Before 11:00 AM</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Location Map Placeholder */}
                        {listing.latitude && listing.longitude && (
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="h6" fontWeight={800} gutterBottom>
                                    Location
                                </Typography>
                                <Box sx={{ height: 300, bgcolor: "#eee", borderRadius: 3, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* If you have Google Maps key handled, insert map here. For now, text fallback or static image */}
                                    <Typography color="var(--text-color)">Map View (Coordinates: {listing.latitude}, {listing.longitude})</Typography>
                                </Box>
                            </Paper>
                        )}

                        {/* Rules & Policy */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                            <Typography variant="h6" fontWeight={800} gutterBottom>
                                House Rules
                            </Typography>
                            <Typography variant="body2" color="var(--text-color)" paragraph>
                                {listing.houseRules || "No specific rules provided by host."}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Right Column: Reservation Details */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            {/* Booking Reference */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="subtitle2" color="var(--text-color)" fontWeight={700} gutterBottom>
                                    CONFIRMATION CODE
                                </Typography>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: "rgba(0,0,0,0.03)", p: 1.5, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: 1 }}>
                                        {trip._id.substring(0, 8).toUpperCase()}
                                    </Typography>
                                    <IconButton size="small" onClick={() => copyToClipboard(trip._id)}>
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Paper>

                            {/* Price Breakdown */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="h6" fontWeight={800} gutterBottom>
                                    Payment Details
                                </Typography>

                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="var(--text-color)">Rs {listing.price} x {nights} nights</Typography>
                                        <Typography variant="body2" fontWeight={600}>Rs {listing.price * nights}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="var(--text-color)">Service Fee</Typography>
                                        <Typography variant="body2" fontWeight={600}>Rs 0</Typography>
                                        {/* Assuming service fee logic is handled elsewhere or included */}
                                    </Stack>
                                    <Divider sx={{ borderStyle: "dashed" }} />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body1" fontWeight={800}>Total (PKR)</Typography>
                                        <Typography variant="body1" fontWeight={900}>Rs {trip.totalPrice}</Typography>
                                    </Stack>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3, color: "success.main" }}>
                                    <PaymentsIcon />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Paid with Credit Card
                                    </Typography>
                                </Stack>
                            </Paper>

                            {trip.status !== 'Cancelled' && trip.status !== 'CANCELLED' && new Date(trip.startDate) > new Date() && (
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                                    <Button
                                        fullWidth
                                        variant="text"
                                        color="error"
                                        onClick={handleOpenCancel}
                                        startIcon={<CancelIcon />}
                                        sx={{ borderRadius: 999, fontWeight: 900, textTransform: 'none' }}
                                    >
                                        Cancel Booking
                                    </Button>
                                </Paper>
                            )}

                            {/* Host Info */}
                            {trip.hostId && ( // Assuming hostId or hostData exists
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            src={host.photoProfile}
                                            alt={host.userName}
                                            sx={{ width: 56, height: 56 }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" color="var(--text-color)" fontWeight={700}>HOSTED BY</Typography>
                                            <Typography variant="h6" fontWeight={900}>{host.userName || "Host"}</Typography>
                                        </Box>
                                    </Stack>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<SupportAgentIcon />}
                                        onClick={handleContactHost}
                                        sx={{ mt: 3, borderRadius: 999, fontWeight: 800, textTransform: 'none' }}
                                    >
                                        Contact Host
                                    </Button>
                                </Paper>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth >
                <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Cancel Booking?</Typography>
                    <Typography color="var(--text-color)" paragraph variant="body2">
                        Are you sure you want to cancel your stay at <b>{trip?.listingId?.title}</b>?
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3, borderStyle: 'dashed' }}>
                        <Typography variant="caption" display="block" color="var(--text-color)" fontWeight={700} gutterBottom>ESTIMATED REFUND</Typography>
                        <Typography variant="h4" fontWeight={900} color={refundQuote && refundQuote.amount > 0 ? "success.main" : "var(--text-color)"}>
                            Rs {refundQuote?.amount || 0}
                        </Typography>
                        <Typography variant="caption" color="var(--text-color)" sx={{ mt: 1, display: 'block' }}>{refundQuote?.reason}</Typography>
                    </Paper>

                    <Stack direction="row" spacing={1} justifyContent="center" width="100%">
                        <Button onClick={() => setCancelDialogOpen(false)} fullWidth sx={{ borderRadius: 999, fontWeight: 800, color: 'text.primary' }}>Keep Booking</Button>
                        <Button variant="contained" color="error" onClick={handleConfirmCancel} fullWidth sx={{ borderRadius: 999, fontWeight: 800 }}>
                            Confirm
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>

        </Box>
    );
};

export default TripDetails;
