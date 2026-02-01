
import React, { useState, useEffect } from 'react';
import { API_BASE_URL, CURRENCY } from '../../config/env';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Button,
    Chip,
    Stack,
    Avatar,
    Grid,
    CircularProgress,
    Divider
} from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const HostBookings = () => {
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [confirmedBookings, setConfirmedBookings] = useState([]);

    const token = localStorage.getItem('token');

    const navigate = useNavigate();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Fetch Pending Requests (Temporary Bookings)
            const pendingRes = await axios.get(`${API_BASE_URL}/temporary-booking`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch Confirmed Bookings
            const confirmedRes = await axios.get(`${API_BASE_URL}/get-confirmed-booking`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter pending to only 'pending_approval' if necessary
            // The API returns all temporary bookings for the host. 
            // We should ideally show 'pending_approval' in Pending tab.
            // 'on_hold' are ppl in checkout flow, maybe ignore?
            const pending = pendingRes.data.bookings || [];
            const pendingApproval = pending.filter(b => b.status === 'pending_approval');

            setBookings(pendingApproval);
            setConfirmedBookings(confirmedRes.data.bookings || []);

        } catch (error) {
            console.error(error);
            // toast.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleApprove = async (bookingId) => {
        try {
            await axios.post(`${API_BASE_URL}/approve-booking/${bookingId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Booking Approved & Confirmed! 🎉");
            fetchBookings();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to approve booking");
        }
    };

    const handleReject = async (bookingId) => {
        if (!window.confirm("Are you sure you want to reject this booking?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/reject-booking/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Booking Rejected");
            fetchBookings();
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject booking");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={900} gutterBottom>Bookings</Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="booking tabs">
                    <Tab label={`Pending Requests (${bookings.length})`} sx={{ fontWeight: 800 }} />
                    <Tab label={`Confirmed Bookings (${confirmedBookings.length})`} sx={{ fontWeight: 800 }} />
                </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
                {bookings.length === 0 ? (
                    <Typography color="var(--text-secondary)">No pending requests.</Typography>
                ) : (
                    <Stack spacing={3}>
                        {bookings.map((booking) => (
                            <Card key={booking._id} sx={{ borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={3} alignItems="center">
                                        <Grid item xs={12} md={8}>
                                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                                <Avatar
                                                    src={booking.userSpecificData?.photoProfile}
                                                    sx={{ width: 56, height: 56 }}
                                                />
                                                <Box>
                                                    <Typography variant="h6" fontWeight={800}>
                                                        {booking.userSpecificData?.name || "Guest"}
                                                    </Typography>
                                                    <Typography variant="body2" color="var(--text-secondary)">
                                                        wants to book <b>{booking.listingId?.title}</b>
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Grid container spacing={2}>
                                                <Grid item xs={6} sm={4}>
                                                    <Typography variant="caption" color="var(--text-secondary)">Dates</Typography>
                                                    <Typography fontWeight={600}>
                                                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={4}>
                                                    <Typography variant="caption" color="var(--text-secondary)">Guests</Typography>
                                                    <Typography fontWeight={600}>{booking.guestCapacity}</Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={4}>
                                                    <Typography variant="caption" color="var(--text-secondary)">Total Payout</Typography>
                                                    <Typography fontWeight={600} color="success.main">{CURRENCY} {booking.totalPrice}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleReject(booking._id)}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                            >
                                                Decline
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleApprove(booking._id)}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
                                            >
                                                Approve
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </TabPanel>

            <TabPanel value={value} index={1}>
                {confirmedBookings.length === 0 ? (
                    <Typography color="var(--text-secondary)">No confirmed bookings yet.</Typography>
                ) : (
                    <Stack spacing={2}>
                        {confirmedBookings.map((booking) => (
                            <Card key={booking._id} variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography fontWeight={700}>
                                                {booking.listingId?.title}
                                            </Typography>
                                            <Typography variant="body2" color="var(--text-secondary)">
                                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Chip label="Confirmed" color="success" size="small" sx={{ fontWeight: 700 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </TabPanel>
        </Container>
    );
};

export default HostBookings;
