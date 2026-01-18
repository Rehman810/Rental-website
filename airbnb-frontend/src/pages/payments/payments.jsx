import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import { fetchData, postData } from '../../config/ServiceApi/serviceApi';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import toast from 'react-hot-toast';

const Payments = () => {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false
    });
    const token = localStorage.getItem('token');

    useEffect(() => {
        const getStatus = async () => {
            try {
                const data = await fetchData('api/stripe/status', token);
                setStatus(data);
            } catch (error) {
                console.error(error);
                // toast.error("Failed to load payment status");
            } finally {
                setLoading(false);
            }
        };
        getStatus();
    }, [token]);

    const handleConnect = async () => {
        try {
            const response = await postData('api/stripe/connect', {}, token);
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate connection");
        }
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    const isConnected = status.charges_enabled && status.payouts_enabled && status.details_submitted;

    return (
        <Box p={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Payments & Payouts</Typography>
            <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Box>
                        <Typography variant="h6" gutterBottom>Stripe Connect Status</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Manage your payouts and verification details securely with Stripe.
                        </Typography>

                        {isConnected ? (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Payouts Active"
                                color="success"
                                sx={{ fontSize: '1rem', px: 1 }}
                            />
                        ) : (
                            <Chip
                                icon={<ErrorIcon />}
                                label={status.details_submitted ? "Pending Verification" : "Action Required"}
                                color={status.details_submitted ? "warning" : "error"}
                                sx={{ fontSize: '1rem', px: 1 }}
                            />
                        )}
                    </Box>

                    {!isConnected && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleConnect}
                            size="large"
                            sx={{ mt: { xs: 2, sm: 0 } }}
                        >
                            {status.details_submitted ? "Continue Onboarding" : "Connect with Stripe"}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default Payments;
