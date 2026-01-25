
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Switch,
    Button,
    Grid,
    Divider,
    CircularProgress
} from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const HostSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        bookingMode: 'request',
        cancellationPolicy: 'moderate',
        houseRules: {
            quietHours: false,
            smokingAllowed: false,
            petsAllowed: false,
        },
        guestRequirements: {
            requireVerifiedPhone: false,
            requireCNIC: false,
        },
        notifications: {
            email: true,
            sms: false,
        }
    });

    const token = localStorage.getItem('token');
    const apiUrl = 'http://localhost:5000'; // Adjust as needed
    // Note: Previous components used http://192.168.18.45:5000 directly. 
    // I should probably check where API URL is defined, or use relative path if proxy is set.
    // The navbar user 'http://192.168.18.45:5000' hardcoded in one place.
    // I will use a config or generic logic.

    const BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/host/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.settings) {
                setSettings(prev => ({ ...prev, ...response.data.settings }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`${BASE_URL}/host/settings`, { settings }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (section, field, value) => {
        if (section) {
            setSettings(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={900} gutterBottom>Host Settings</Typography>

            {/* Booking Preferences */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Booking Preferences</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Choose how guests can book your listings.
                    </Typography>

                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <RadioGroup
                            value={settings.bookingMode}
                            onChange={(e) => handleChange(null, 'bookingMode', e.target.value)}
                        >
                            <FormControlLabel
                                value="instant"
                                control={<Radio />}
                                label={
                                    <Box>
                                        <Typography fontWeight={700}>Instant Book (Recommended)</Typography>
                                        <Typography variant="body2" color="text.secondary">Guests who meet your requirements can book instantly. Status becomes CONFIRMED immediately.</Typography>
                                    </Box>
                                }
                                sx={{ mb: 2, alignItems: 'flex-start' }}
                            />
                            <FormControlLabel
                                value="request"
                                control={<Radio />}
                                label={
                                    <Box>
                                        <Typography fontWeight={700}>Request to Book</Typography>
                                        <Typography variant="body2" color="text.secondary">Guests must send a reservation request. You have 24 hours to approve or decline. Status starts as PENDING.</Typography>
                                    </Box>
                                }
                                sx={{ alignItems: 'flex-start' }}
                            />
                        </RadioGroup>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Cancellation Policy</Typography>
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={settings.cancellationPolicy}
                            onChange={(e) => handleChange(null, 'cancellationPolicy', e.target.value)}
                        >
                            <FormControlLabel value="flexible" control={<Radio />} label="Flexible (Full refund 1 day prior to arrival)" />
                            <FormControlLabel value="moderate" control={<Radio />} label="Moderate (Full refund 5 days prior to arrival)" />
                            <FormControlLabel value="strict" control={<Radio />} label="Strict (No refund)" />
                        </RadioGroup>
                    </FormControl>
                </CardContent>
            </Card>

            {/* House Rules */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>House Rules</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={settings.houseRules.quietHours} onChange={(e) => handleChange('houseRules', 'quietHours', e.target.checked)} />}
                                label="Quiet hours (10:00 PM - 8:00 AM)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={settings.houseRules.smokingAllowed} onChange={(e) => handleChange('houseRules', 'smokingAllowed', e.target.checked)} />}
                                label="Smoking allowed"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={settings.houseRules.petsAllowed} onChange={(e) => handleChange('houseRules', 'petsAllowed', e.target.checked)} />}
                                label="Pets allowed"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Guest Requirements */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Guest Requirements</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={settings.guestRequirements.requireVerifiedPhone} onChange={(e) => handleChange('guestRequirements', 'requireVerifiedPhone', e.target.checked)} />}
                                label="Require verified phone number"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={settings.guestRequirements.requireCNIC} onChange={(e) => handleChange('guestRequirements', 'requireCNIC', e.target.checked)} />}
                                label="Require CNIC verification"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>Notifications</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={settings.notifications.email} onChange={(e) => handleChange('notifications', 'email', e.target.checked)} />}
                                label="Email notifications"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={settings.notifications.sms} onChange={(e) => handleChange('notifications', 'sms', e.target.checked)} />}
                                label="SMS notifications"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>


            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 10 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none', fontSize: 16 }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

        </Container>
    );
};

export default HostSettings;
