import React, { useState, useEffect } from 'react';
import { getAuthToken } from "../../utils/cookieUtils";
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
    CircularProgress,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    useMediaQuery,
    InputAdornment
} from '@mui/material';
import {
    AutoAwesome as AutoAwesomeIcon,
    VpnKey as KeyIcon,
    InfoOutlined as InfoIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config/env';
import apiClient from '../../config/ServiceApi/apiClient';
import usePageTitle from "../../hooks/usePageTitle";

const HostSettings = () => {
    usePageTitle("Settings");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const isMobile = useMediaQuery("(max-width:1100px)");
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
        },
        aiAssistant: {
            enabled: false,
            geminiApiKey: '',
        },
        availability: {
            minNights: 1,
            maxNights: 30,
            allowSameDayBooking: false,
            minNoticeDays: 1,
            bookingWindowMonths: 6,
            checkInFrom: "14:00",
            checkOutBy: "11:00"
        }

    });

    const token = getAuthToken();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await apiClient.get(`${API_BASE_URL}/host/settings`, {
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
            await apiClient.put(`${API_BASE_URL}/host/settings`, { settings }, {
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

    const pageWrapSx = {
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
        background: 'linear-gradient(180deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.00) 35%)',
    };

    const cardSx = {
        mb: 2.5,
        borderRadius: 4,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 10px 40px rgba(15, 23, 42, 0.08)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(6px)',
        overflow: 'hidden',
    };

    const cardContentSx = {
        p: { xs: 2.5, md: 4 },
    };

    const sectionHeaderSx = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 1.5,
    };

    const sectionTitleSx = {
        fontWeight: 900,
        letterSpacing: '-0.3px',
    };

    const sectionDescSx = {
        color: 'var(--text-secondary)',
        mt: 0.25,
        maxWidth: 720,
        lineHeight: 1.6,
    };

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 3,
        },
        '& .MuiInputLabel-root': {
            fontWeight: 700,
        },
    };

    const switchRowSx = {
        m: 0,
        px: 1.5,
        py: 1.25,
        borderRadius: 3,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(15, 23, 42, 0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        '& .MuiFormControlLabel-label': {
            fontWeight: 700,
        },
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={pageWrapSx}>
            <Container maxWidth="md">
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 950,
                            letterSpacing: '-0.6px',
                            mb: 0.5
                        }}
                    >
                        Host Settings
                    </Typography>

                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        Manage booking rules, availability, guest requirements, and notifications — clean and simple.
                    </Typography>
                </Box>

                {/* Booking Preferences */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    Booking Preferences
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    Choose how guests can book your listings.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                            <RadioGroup
                                value={settings.bookingMode}
                                onChange={(e) => handleChange(null, 'bookingMode', e.target.value)}
                                sx={{
                                    gap: 1.25,
                                    '& .MuiFormControlLabel-root': {
                                        m: 0,
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1px solid rgba(15, 23, 42, 0.08)',
                                        background: 'rgba(15, 23, 42, 0.02)',
                                        alignItems: 'flex-start',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: 'rgba(15, 23, 42, 0.04)',
                                        }
                                    }
                                }}
                            >
                                <FormControlLabel
                                    value="instant"
                                    control={<Radio />}
                                    label={
                                        <Box>
                                            <Typography fontWeight={900}>Instant Book (Recommended)</Typography>
                                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.25, lineHeight: 1.6 }}>
                                                Guests who meet your requirements can book instantly. Status becomes <b>CONFIRMED</b> immediately.
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="request"
                                    control={<Radio />}
                                    label={
                                        <Box>
                                            <Typography fontWeight={900}>Request to Book</Typography>
                                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.25, lineHeight: 1.6 }}>
                                                Guests must send a reservation request. You have <b>24 hours</b> to approve or decline. Status starts as <b>PENDING</b>.
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Availability Rules */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    Availability Rules (Default)
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    Set default availability rules for your listings. You can override these per listing.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label="Minimum Nights"
                                    type="number"
                                    value={settings.availability?.minNights ?? 1}
                                    onChange={(e) => handleChange('availability', 'minNights', parseInt(e.target.value))}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label="Maximum Nights"
                                    type="number"
                                    value={settings.availability?.maxNights ?? 30}
                                    onChange={(e) => handleChange('availability', 'maxNights', parseInt(e.target.value))}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={
                                        <Switch
                                            checked={settings.availability?.allowSameDayBooking ?? false}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                handleChange('availability', 'allowSameDayBooking', checked);
                                                if (!checked && (settings.availability?.minNoticeDays ?? 1) < 1) {
                                                    handleChange('availability', 'minNoticeDays', 1);
                                                }
                                            }}
                                        />
                                    }
                                    label="Allow same-day booking"
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" sx={fieldSx}>
                                    <InputLabel>Minimum Notice</InputLabel>
                                    <Select
                                        value={settings.availability?.minNoticeDays ?? 1}
                                        label="Minimum Notice"
                                        onChange={(e) => handleChange('availability', 'minNoticeDays', e.target.value)}
                                    >
                                        <MenuItem value={0} disabled={!settings.availability?.allowSameDayBooking}>
                                            Same Day (0 days)
                                        </MenuItem>
                                        <MenuItem value={1}>1 Day</MenuItem>
                                        <MenuItem value={2}>2 Days</MenuItem>
                                        <MenuItem value={7}>7 Days</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" sx={fieldSx}>
                                    <InputLabel>Booking Window</InputLabel>
                                    <Select
                                        value={settings.availability?.bookingWindowMonths ?? 6}
                                        label="Booking Window"
                                        onChange={(e) => handleChange('availability', 'bookingWindowMonths', e.target.value)}
                                    >
                                        <MenuItem value={1}>1 Month</MenuItem>
                                        <MenuItem value={3}>3 Months</MenuItem>
                                        <MenuItem value={6}>6 Months</MenuItem>
                                        <MenuItem value={12}>12 Months</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label="Check-in From"
                                    type="time"
                                    value={settings.availability?.checkInFrom ?? "14:00"}
                                    onChange={(e) => handleChange('availability', 'checkInFrom', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label="Check-out By"
                                    type="time"
                                    value={settings.availability?.checkOutBy ?? "11:00"}
                                    onChange={(e) => handleChange('availability', 'checkOutBy', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Cancellation Policy */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    Cancellation Policy
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    Define your refund terms so guests know what to expect.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                            <RadioGroup
                                value={settings.cancellationPolicy}
                                onChange={(e) => handleChange(null, 'cancellationPolicy', e.target.value)}
                                sx={{
                                    gap: 1,
                                    '& .MuiFormControlLabel-root': {
                                        m: 0,
                                        px: 1.5,
                                        py: 1.25,
                                        borderRadius: 3,
                                        border: '1px solid rgba(15, 23, 42, 0.08)',
                                        background: 'rgba(15, 23, 42, 0.02)',
                                    }
                                }}
                            >
                                <FormControlLabel value="flexible" control={<Radio />} label="Flexible (Full refund 1 day prior to arrival)" />
                                <FormControlLabel value="moderate" control={<Radio />} label="Moderate (Full refund 5 days prior to arrival)" />
                                <FormControlLabel value="strict" control={<Radio />} label="Strict (No refund)" />
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* House Rules */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    House Rules
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    Set expectations upfront to avoid drama later.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={1.5}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.houseRules.quietHours} onChange={(e) => handleChange('houseRules', 'quietHours', e.target.checked)} />}
                                    label="Quiet hours (10:00 PM - 8:00 AM)"
                                    labelPlacement="start"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.houseRules.smokingAllowed} onChange={(e) => handleChange('houseRules', 'smokingAllowed', e.target.checked)} />}
                                    label="Smoking allowed"
                                    labelPlacement="start"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.houseRules.petsAllowed} onChange={(e) => handleChange('houseRules', 'petsAllowed', e.target.checked)} />}
                                    label="Pets allowed"
                                    labelPlacement="start"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Guest Requirements */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    Guest Requirements
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    Decide what a guest must have before they can book.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireVerifiedPhone} onChange={(e) => handleChange('guestRequirements', 'requireVerifiedPhone', e.target.checked)} />}
                                    label="Require verified phone number"
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireVerifiedEmail} onChange={(e) => handleChange('guestRequirements', 'requireVerifiedEmail', e.target.checked)} />}
                                    label="Require verified email"
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireCNIC} onChange={(e) => handleChange('guestRequirements', 'requireCNIC', e.target.checked)} />}
                                    label="Require CNIC verification"
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireProfilePhoto} onChange={(e) => handleChange('guestRequirements', 'requireProfilePhoto', e.target.checked)} />}
                                    label="Require profile photo"
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireCompletedProfile} onChange={(e) => handleChange('guestRequirements', 'requireCompletedProfile', e.target.checked)} />}
                                    label="Require completed profile"
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label="Minimum Account Age (Days)"
                                    type="number"
                                    value={settings.guestRequirements.minAccountAgeDays ?? 0}
                                    onChange={(e) => handleChange('guestRequirements', 'minAccountAgeDays', parseInt(e.target.value))}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* AI Host Assistant */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={{ ...sectionTitleSx, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AutoAwesomeIcon sx={{ color: '#8b5cf6' }} />
                                    AI Host Assistant
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    Activate the AI Guest Assistant for your listings by connecting your Google Gemini API Key.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                How it works
                            </Typography>
                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 2, lineHeight: 1.6 }}>
                                The AI uses the Gemini model to generate responses on your behalf. It automatically helps you respond to guest messages, answer questions about your property, share pricing and availability, and assist during the booking process.
                            </Typography>

                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Steps to enable
                            </Typography>
                            <Box component="ol" sx={{ pl: 2, mb: 3, '& li': { mb: 0.5, fontSize: '0.875rem', color: 'var(--text-secondary)' } }}>
                                <li>Go to <b>Google AI Studio</b></li>
                                <li>Generate your <b>Gemini API Key</b></li>
                                <li>Paste the key in the field below</li>
                                <li>Toggle the switch to Activate AI Assistant</li>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label="Gemini API Key"
                                    placeholder="Paste your Gemini API key here"
                                    type="password"
                                    value={settings.aiAssistant?.geminiApiKey ?? ''}
                                    onChange={(e) => handleChange('aiAssistant', 'geminiApiKey', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <KeyIcon sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={
                                        <Switch
                                            checked={settings.aiAssistant?.enabled ?? false}
                                            onChange={(e) => handleChange('aiAssistant', 'enabled', e.target.checked)}
                                        />
                                    }
                                    label={settings.aiAssistant?.enabled ? "AI Assistant Active" : "Activate AI Assistant"}
                                    labelPlacement="start"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                            <Typography variant="caption" color="var(--text-primary)" display="block" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Important Notes:
                            </Typography>
                            <Typography variant="caption" color="var(--text-secondary)" component="div">
                                • Your API key is stored securely and used only for AI responses.<br />
                                • You can disable or replace your API key anytime.<br />
                                • API usage costs depend on your Gemini account and Google billing.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    Notifications
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    Keep your comms tight — get updates your way.
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={1.5}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.notifications.email} onChange={(e) => handleChange('notifications', 'email', e.target.checked)} />}
                                    label="Email notifications"
                                    labelPlacement="start"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.notifications.sms} onChange={(e) => handleChange('notifications', 'sms', e.target.checked)} />}
                                    label="SMS notifications"
                                    labelPlacement="start"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Sticky Save Bar */}
                <Box
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        mt: 3,
                        pb: 2,
                        pt: 2,
                        background: `
  linear-gradient(
    180deg,
    transparent 0%,
    var(--bg-secondary) 40%,
    var(--bg-primary) 100%
  )
`,
                        backdropFilter: 'blur(6px)',
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                            borderRadius: 4,

                            border: "1px solid var(--border-light)",
                            backgroundColor: "var(--bg-card)",
                            boxShadow: "var(--shadow-md)",

                            px: { xs: 2, md: 3 },
                            py: 1.5,
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                Ready to apply changes?
                            </Typography>
                            {!isMobile && (
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                    Save once and you’re good to go.
                                </Typography>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                px: 4,
                                py: 1.4,
                                borderRadius: 3,
                                fontWeight: 900,
                                textTransform: 'none',
                                fontSize: 15,
                                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                            }}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default HostSettings;
