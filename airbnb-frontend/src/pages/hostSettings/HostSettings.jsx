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
import { useTranslation } from 'react-i18next';
import { RTLWrapper, useRTL } from "../../components/language/Localization";
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
    const { t } = useTranslation("translation");
    usePageTitle(t("hosting.settings.title"));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const isMobile = useMediaQuery("(max-width:1100px)");
    const isRTL = useRTL();
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
            toast.error(t("hosting.settings.loadError"));
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
            toast.success(t("hosting.settings.saveSuccess"));
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error(t("hosting.settings.saveError"));
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
                <Typography sx={{ ml: 2 }}>{t("hosting.settings.loading")}</Typography>
            </Box>
        );
    }

    return (
        <RTLWrapper sx={pageWrapSx}>
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
                        {t("hosting.settings.title")}
                    </Typography>

                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {t("hosting.settings.desc")}
                    </Typography>
                </Box>

                {/* Booking Preferences */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    {t("hosting.settings.bookingPrefs")}
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    {t("hosting.settings.bookingPrefsDesc")}
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
                                            <Typography fontWeight={900}>{t("hosting.settings.instantBook")}</Typography>
                                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.25, lineHeight: 1.6 }}>
                                                {t("hosting.settings.instantBookDesc")}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="request"
                                    control={<Radio />}
                                    label={
                                        <Box>
                                            <Typography fontWeight={900}>{t("hosting.settings.requestToBook")}</Typography>
                                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.25, lineHeight: 1.6 }}>
                                                {t("hosting.settings.requestToBookDesc")}
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
                                    {t("hosting.settings.availabilityRules")}
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    {t("hosting.settings.availabilityRulesDesc")}
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
                                    label={t("hosting.settings.minNights")}
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
                                    label={t("hosting.settings.maxNights")}
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
                                    label={t("hosting.settings.allowSameDay")}
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" sx={fieldSx}>
                                    <InputLabel>{t("hosting.settings.minNotice")}</InputLabel>
                                    <Select
                                        value={settings.availability?.minNoticeDays ?? 1}
                                        label={t("hosting.settings.minNotice")}
                                        onChange={(e) => handleChange('availability', 'minNoticeDays', e.target.value)}
                                    >
                                        <MenuItem value={0} disabled={!settings.availability?.allowSameDayBooking}>
                                            {t("hosting.settings.sameDay")}
                                        </MenuItem>
                                        <MenuItem value={1}>{t("hosting.settings.day", { count: 1 })}</MenuItem>
                                        <MenuItem value={2}>{t("hosting.settings.days", { count: 2 })}</MenuItem>
                                        <MenuItem value={7}>{t("hosting.settings.days", { count: 7 })}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" sx={fieldSx}>
                                    <InputLabel>{t("hosting.settings.bookingWindow")}</InputLabel>
                                    <Select
                                        value={settings.availability?.bookingWindowMonths ?? 6}
                                        label={t("hosting.settings.bookingWindow")}
                                        onChange={(e) => handleChange('availability', 'bookingWindowMonths', e.target.value)}
                                    >
                                        <MenuItem value={1}>{t("hosting.settings.month", { count: 1 })}</MenuItem>
                                        <MenuItem value={3}>{t("hosting.settings.months", { count: 3 })}</MenuItem>
                                        <MenuItem value={6}>{t("hosting.settings.months", { count: 6 })}</MenuItem>
                                        <MenuItem value={12}>{t("hosting.settings.months", { count: 12 })}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label={t("hosting.settings.checkInFrom")}
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
                                    label={t("hosting.settings.checkOutBy")}
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
                                    {t("hosting.settings.cancellationPolicy")}
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    {t("hosting.settings.cancellationPolicyDesc")}
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
                                <FormControlLabel value="flexible" control={<Radio />} label={t("hosting.settings.flexible")} />
                                <FormControlLabel value="moderate" control={<Radio />} label={t("hosting.settings.moderate")} />
                                <FormControlLabel value="strict" control={<Radio />} label={t("hosting.settings.strict")} />
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
                                    {t("hosting.settings.houseRules")}
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    {t("hosting.settings.houseRulesDesc")}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={1.5}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.houseRules.quietHours} onChange={(e) => handleChange('houseRules', 'quietHours', e.target.checked)} />}
                                    label={t("hosting.settings.quietHours")}
                                    labelPlacement="start"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.houseRules.smokingAllowed} onChange={(e) => handleChange('houseRules', 'smokingAllowed', e.target.checked)} />}
                                    label={t("hosting.settings.smokingAllowed")}
                                    labelPlacement="start"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.houseRules.petsAllowed} onChange={(e) => handleChange('houseRules', 'petsAllowed', e.target.checked)} />}
                                    label={t("hosting.settings.petsAllowed")}
                                    labelPlacement="start"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Guest Requirements */}
                {/* <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={sectionTitleSx}>
                                    {t("hosting.settings.guestRequirements")}
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    {t("hosting.settings.guestRequirementsDesc")}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireVerifiedPhone} onChange={(e) => handleChange('guestRequirements', 'requireVerifiedPhone', e.target.checked)} />}
                                    label={t("hosting.settings.requirePhone")}
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireVerifiedEmail} onChange={(e) => handleChange('guestRequirements', 'requireVerifiedEmail', e.target.checked)} />}
                                    label={t("hosting.settings.requireEmail")}
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireCNIC} onChange={(e) => handleChange('guestRequirements', 'requireCNIC', e.target.checked)} />}
                                    label={t("hosting.settings.requireCNIC")}
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireProfilePhoto} onChange={(e) => handleChange('guestRequirements', 'requireProfilePhoto', e.target.checked)} />}
                                    label={t("hosting.settings.requirePhoto")}
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.guestRequirements.requireCompletedProfile} onChange={(e) => handleChange('guestRequirements', 'requireCompletedProfile', e.target.checked)} />}
                                    label={t("hosting.settings.requireProfile")}
                                    labelPlacement="start"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label={t("hosting.settings.minAccountAge")}
                                    type="number"
                                    value={settings.guestRequirements.minAccountAgeDays ?? 0}
                                    onChange={(e) => handleChange('guestRequirements', 'minAccountAgeDays', parseInt(e.target.value))}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card> */}

                {/* AI Host Assistant */}
                <Card sx={cardSx}>
                    <CardContent sx={cardContentSx}>
                        <Box sx={sectionHeaderSx}>
                            <Box>
                                <Typography variant="h6" sx={{ ...sectionTitleSx, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AutoAwesomeIcon sx={{ color: '#8b5cf6' }} />
                                    {t("hosting.settings.aiAssistant")}
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    {t("hosting.settings.aiAssistantDesc")}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                {t("hosting.settings.howItWorks")}
                            </Typography>
                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 2, lineHeight: 1.6 }}>
                                {t("hosting.settings.howItWorksDesc")}
                            </Typography>

                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                {t("hosting.settings.stepsToEnable")}
                            </Typography>
                            <Box component="ol" sx={{ pl: 2, mb: 3, '& li': { mb: 0.5, fontSize: '0.875rem', color: 'var(--text-secondary)' } }}>
                                <li>{t("hosting.settings.step1")}</li>
                                <li>{t("hosting.settings.step2")}</li>
                                <li>{t("hosting.settings.step3")}</li>
                                <li>{t("hosting.settings.step4")}</li>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                    label={t("hosting.settings.apiKey")}
                                    placeholder={t("hosting.settings.apiKeyPlaceholder")}
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
                                    label={settings.aiAssistant?.enabled ? t("hosting.settings.aiActive") : t("hosting.settings.activateAi")}
                                    labelPlacement="start"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                            <Typography variant="caption" color="var(--text-primary)" display="block" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {t("hosting.settings.importantNotes")}:
                            </Typography>
                            <Typography variant="caption" color="var(--text-secondary)" component="div">
                                • {t("hosting.settings.note1")}<br />
                                • {t("hosting.settings.note2")}<br />
                                • {t("hosting.settings.note3")}
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
                                    {t("hosting.settings.notifications")}
                                </Typography>
                                <Typography variant="body2" sx={sectionDescSx}>
                                    {t("hosting.settings.notificationsDesc")}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={1.5}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.notifications.email} onChange={(e) => handleChange('notifications', 'email', e.target.checked)} />}
                                    label={t("hosting.settings.emailNotifications")}
                                    labelPlacement="start"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    sx={switchRowSx}
                                    control={<Switch checked={settings.notifications.sms} onChange={(e) => handleChange('notifications', 'sms', e.target.checked)} />}
                                    label={t("hosting.settings.smsNotifications")}
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
                                {t("hosting.settings.readyToApply")}
                            </Typography>
                            {!isMobile && (
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                    {t("hosting.settings.saveOnce")}
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
                            {saving ? t("hosting.settings.saving") : t("hosting.settings.save")}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </RTLWrapper>
    );
};

export default HostSettings;
