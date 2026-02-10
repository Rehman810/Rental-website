import React, { useEffect, useState } from "react";
import { getAuthToken } from "../../utils/cookieUtils";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Stack,
    Chip,
    CircularProgress,
} from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentsIcon from "@mui/icons-material/Payments";

import { fetchData } from "../../config/ServiceApi/serviceApi";
import { useBookingContext } from "../../context/booking";
import { CURRENCY } from "../../config/env";


const ConfirmedBookings = () => {
    const [confirmed, setConfirmed] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = getAuthToken();
    const { setConfirmedBookings } = useBookingContext();

    useEffect(() => {
        const fetchConfirmed = async () => {
            try {
                setLoading(true);
                const response = await fetchData("get-confirmed-booking");

                const list = response?.bookings || [];
                setConfirmed(list);
                setConfirmedBookings(response?.count || list.length);
            } catch (err) {
                console.error("Confirmed bookings fetch error:", err);
                setConfirmed([]);
                setConfirmedBookings(0);
            } finally {
                setLoading(false);
            }
        };

        fetchConfirmed();
    }, [token, setConfirmedBookings]);

    if (loading) {
        return (
            <Box sx={{ py: 6, textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }} fontWeight={900}>
                    Loading confirmed bookings...
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)">
                    Syncing your confirmed reservations.
                </Typography>
            </Box>
        );
    }

    if (!confirmed || confirmed.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <SentimentDissatisfiedIcon sx={{ fontSize: 52, color: "var(--text-secondary)" }} />
                <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>
                    No confirmed bookings yet
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
                    Once you approve requests, they’ll show up here.
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {confirmed.map((booking) => {
                const listing = booking?.listingId;

                return (
                    <Paper
                        key={booking?._id}
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
                            {/* Image */}
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
                                        src={listing?.photos?.[0]}
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
                                        label="Confirmed"
                                        sx={{
                                            position: "absolute",
                                            top: 12,
                                            left: 12,
                                            borderRadius: 999,
                                            fontWeight: 900,
                                            backgroundColor: "rgba(46,125,50,0.85)",
                                            color: "white",
                                        }}
                                    />
                                </Box>
                            </Grid>

                            {/* Content */}
                            <Grid item xs={12} md={8}>
                                <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1}
                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                        justifyContent="space-between"
                                    >
                                        <Box>
                                            <Typography variant="h6" fontWeight={900}>
                                                {listing?.title || "Untitled listing"}
                                            </Typography>

                                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.4 }}>
                                                <LocationOnIcon sx={{ fontSize: 18, color: "var(--text-secondary)" }} />
                                                <Typography variant="body2" color="var(--text-secondary)">
                                                    {listing?.city || "Unknown city"}
                                                </Typography>
                                            </Stack>

                                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 1 }}>
                                                {booking?.startDate
                                                    ? new Date(booking.startDate).toLocaleDateString()
                                                    : "N/A"}{" "}
                                                -{" "}
                                                {booking?.endDate
                                                    ? new Date(booking.endDate).toLocaleDateString()
                                                    : "N/A"}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            icon={<PaymentsIcon />}
                                            label={`${CURRENCY} ${booking?.totalPrice || 0}`}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 999,
                                                fontWeight: 900,
                                                px: 1,
                                                color: "var(--text-secondary)",
                                            }}
                                        />
                                    </Stack>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body2" color="var(--text-secondary)">
                                        Guests: <b>{booking?.guestCapacity || 0}</b>
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                );
            })}
        </Stack>
    );
};

export default ConfirmedBookings;
