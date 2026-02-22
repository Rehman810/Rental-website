import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Paper, TextField, Stack, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { applyForLease } from '../../config/ServiceApi/longTermService';
import { getAuthToken } from '../../utils/cookieUtils';
import toast from 'react-hot-toast';
import BusinessIcon from '@mui/icons-material/Business';
import attachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ApplyPage = () => {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const token = getAuthToken();

    // Listing data passed via state or fetch it if needed. 
    // Assuming monthlyMonth is passed or we default/fetch it.
    const listingData = location.state || { monthlyRent: 0 };

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        monthlyRent: listingData.monthlyRent || 0,
        income: '',
        employer: '',
        currentAddress: '',
        moveInDate: '',
        employmentDuration: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSubmit = {
                listingId,
                monthlyRent: formData.monthlyRent,
                income: Number(formData.income),
                employer: formData.employer,
                currentAddress: formData.currentAddress,
                moveInDate: formData.moveInDate,
                employmentDuration: Number(formData.employmentDuration)
            };

            const res = await applyForLease(dataToSubmit, token);
            toast.success("Application Submitted Successfully");
            navigate(`/long-term/agreement/${res.agreement._id}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto", mt: 4, mb: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" fontWeight={900} gutterBottom>Apply for 11-Month Lease</Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                    Complete your application to start the rental process. No immediate agreement signing required.
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                    Your application will be reviewed by the landlord before documents are requested.
                </Alert>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="Monthly Income (PKR)"
                            name="income"
                            type="number"
                            required
                            fullWidth
                            value={formData.income}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                            }}
                        />

                        <TextField
                            label="Current Employer / Business Name"
                            name="employer"
                            required
                            fullWidth
                            value={formData.employer}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><BusinessIcon /></InputAdornment>,
                            }}
                        />

                        <TextField
                            label="Employment Duration (Months)"
                            name="employmentDuration"
                            type="number"
                            required
                            fullWidth
                            helperText="How long have you been at this job?"
                            value={formData.employmentDuration}
                            onChange={handleChange}
                        />

                        <TextField
                            label="Current Residential Address"
                            name="currentAddress"
                            required
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.currentAddress}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment>,
                            }}
                        />

                        <TextField
                            label="Desired Move-In Date"
                            name="moveInDate"
                            type="date"
                            required
                            fullWidth
                            value={formData.moveInDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment>,
                            }}
                        />

                        <Box sx={{ pt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
};

export default ApplyPage;
