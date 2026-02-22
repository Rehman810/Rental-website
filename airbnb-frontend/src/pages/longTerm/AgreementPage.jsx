import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, Stack, Chip, Divider, CircularProgress,
    Alert, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
    getAgreement,
    generateLeaseAgreement,
    sendOtp,
    verifyOtp,
    activateLease
} from '../../config/ServiceApi/longTermService';
import { getAuthToken } from '../../utils/cookieUtils';
import toast from 'react-hot-toast';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GavelIcon from '@mui/icons-material/Gavel';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PaymentIcon from '@mui/icons-material/Payment';

const AgreementPage = () => {
    const { agreementId } = useParams();
    const token = getAuthToken();
    const navigate = useNavigate();

    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // OTP State
    const [otpOpen, setOtpOpen] = useState(false);
    const [otp, setOtp] = useState('');

    useEffect(() => {
        fetchAgreement();
    }, [agreementId]);

    const fetchAgreement = async () => {
        try {
            const data = await getAgreement(agreementId, token);
            setAgreement(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleGenerateAgreement = async () => {
        setActionLoading(true);
        try {
            await generateLeaseAgreement(agreementId, token);
            toast.success("Agreement Generated!");
            fetchAgreement();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleInitiateSigning = async () => {
        setActionLoading(true);
        try {
            await sendOtp(agreementId, token);
            setOtpOpen(true);
            toast.success("OTP Sent to your mobile.");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setActionLoading(true);
        try {
            await verifyOtp(agreementId, otp, token);
            toast.success("Agreement Signed Successfully!");
            setOtpOpen(false);
            fetchAgreement();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayment = async () => {
        setActionLoading(true);
        try {
            // In real app, redirect to Stripe/Payment Gateway
            await activateLease(agreementId, token);
            toast.success("Payment Successful. Lease Active!");
            fetchAgreement();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!agreement) return <Typography>Agreement not found</Typography>;

    const StatusView = () => {
        switch (agreement.status) {
            case 'pending':
                return (
                    <Box textAlign="center" py={5}>
                        <HourglassEmptyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" fontWeight={700}>Application Under Review</Typography>
                        <Typography color="text.secondary">
                            Your application is currently pending landlord approval. You will be notified once the next step is available.
                        </Typography>
                    </Box>
                );

            case 'rejected':
                return (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography fontWeight={700}>Application Rejected</Typography>
                        Unfortunately, your lease application was not approved by the landlord.
                    </Alert>
                );

            case 'documentsRequested':
            case 'preApproved': // Treating preApproved same as documentsRequested if no explicit status change
                return (
                    <Box textAlign="center" py={5}>
                        <Alert severity="success" sx={{ mb: 4, display: 'inline-flex' }}>Application Pre-Approved!</Alert>
                        <Typography variant="h5" fontWeight={700} gutterBottom>Identity Verification Required</Typography>
                        <Typography color="text.secondary" mb={4}>
                            Please upload your CNIC and perform a live face check to proceed.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<UploadFileIcon />}
                            onClick={() => navigate(`/long-term/verification/${agreementId}`)}
                            sx={{ borderRadius: 2 }}
                        >
                            Upload Documents
                        </Button>
                    </Box>
                );

            case 'verified':
                return (
                    <Box textAlign="center" py={5}>
                        <VerifiedUserIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight={700} gutterBottom>Verification Complete</Typography>
                        <Typography color="text.secondary" mb={4}>
                            Your identity has been verified. You can now generate and review the lease agreement.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleGenerateAgreement}
                            disabled={actionLoading}
                            sx={{ borderRadius: 2 }}
                        >
                            {actionLoading ? "Generating..." : "Generate Lease Agreement"}
                        </Button>
                    </Box>
                );

            case 'approved':
                return (
                    <Stack spacing={2}>
                        <Alert severity="info">Please review the agreement below carefully before signing.</Alert>
                        <AgreementContractView agreement={agreement} />
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleInitiateSigning}
                            sx={{ mt: 2, bgcolor: 'primary.main', fontWeight: 700 }}
                        >
                            Sign Agreement (OTP)
                        </Button>
                    </Stack>
                );

            case 'agreementSigned':
                return (
                    <Box textAlign="center" py={5}>
                        <HistoryEduIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight={700} gutterBottom>Agreement Signed</Typography>
                        <Typography color="text.secondary" mb={4}>
                            The agreement is signed. Please pay the security deposit and first month's rent to activate the lease.
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 3, maxWidth: 400, mx: "auto", mb: 3, textAlign: 'left' }}>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography>Security Deposit</Typography>
                                <Typography fontWeight={700}>Rs {agreement.securityDeposit?.toLocaleString()}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography>First Month Rent</Typography>
                                <Typography fontWeight={700}>Rs {agreement.monthlyRent?.toLocaleString()}</Typography>
                            </Stack>
                            <Divider sx={{ my: 2 }} />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="h6">Total Due</Typography>
                                <Typography variant="h6" color="primary">Rs {(agreement.securityDeposit + agreement.monthlyRent)?.toLocaleString()}</Typography>
                            </Stack>
                        </Paper>
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            startIcon={<PaymentIcon />}
                            onClick={handlePayment}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : "Pay & Activate Lease"}
                        </Button>
                    </Box>
                );

            case 'active':
                return (
                    <Stack spacing={2}>
                        <Alert severity="success">Lease is Active and Digitally Notarized.</Alert>
                        <AgreementContractView agreement={agreement} isActive={true} />
                    </Stack>
                );

            default:
                // Fallback for legacy statuses or unknown
                return (
                    <Stack spacing={2}>
                        <Alert severity="warning">Legacy Status: {agreement.status}</Alert>
                        <AgreementContractView agreement={agreement} />
                    </Stack>
                );
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto", mt: 2, mb: 10 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>Lease Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">ID: {agreement._id}</Typography>
                </Box>
                <Chip
                    label={agreement.status.replace(/([A-Z])/g, ' $1').toUpperCase()} // Snake to Space
                    color={agreement.status === 'active' ? "success" : "warning"}
                    sx={{ fontWeight: 800, borderRadius: 1, px: 1, py: 2.5 }}
                />
            </Stack>

            {/* Status-Driven UI */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <StatusView />
            </Paper>

            {/* OTP Dialog */}
            <Dialog open={otpOpen} onClose={() => setOtpOpen(false)}>
                <DialogTitle>Sign Agreement</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the OTP sent to your registered mobile number to digitally sign this agreement.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="OTP Code"
                        fullWidth
                        variant="outlined"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOtpOpen(false)}>Cancel</Button>
                    <Button onClick={handleVerifyOtp} variant="contained" disabled={actionLoading}>
                        {actionLoading ? "Verifying..." : "Verify & Sign"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// Reusable Contract Display Component
const AgreementContractView = ({ agreement, isActive }) => (
    <Paper
        elevation={0}
        sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minHeight: 400,
            position: 'relative',
            mt: 2
        }}
    >
        {isActive && (
            <Box sx={{
                position: 'absolute',
                top: '10%',
                right: '5%',
                transform: 'rotate(-20deg)',
                border: '4px solid #2e7d32',
                borderRadius: 4,
                p: 2,
                opacity: 0.2,
                pointerEvents: 'none'
            }}>
                <Typography variant="h2" fontWeight={900} color="#2e7d32">NOTARIZED</Typography>
            </Box>
        )}

        <Typography variant="h5" fontWeight={700} gutterBottom align="center">Residential Tenancy Agreement</Typography>
        <Divider sx={{ my: 3 }} />

        <Stack spacing={2}>
            <Typography variant="body2">
                <b>Landlord:</b> {agreement.hostId?.firstName} {agreement.hostId?.lastName} <br />
                <b>Tenant:</b> {agreement.tenantId?.firstName} {agreement.tenantId?.lastName}
            </Typography>
            <Typography variant="body2">
                <b>Property:</b> {agreement.listingId?.street}, {agreement.listingId?.city} <br />
                <b>Term:</b> {new Date(agreement.startDate).toDateString()} - {new Date(agreement.endDate).toDateString()}
            </Typography>
            <Typography variant="body2">
                <b>Rent:</b> Rs {agreement.monthlyRent?.toLocaleString()} | <b>Deposit:</b> Rs {agreement.securityDeposit?.toLocaleString()}
            </Typography>

            <Box bgcolor="grey.50" p={2} borderRadius={2}>
                <Typography variant="subtitle2" fontWeight={700}>Terms:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {agreement.terms ? JSON.parse(agreement.terms).clause1 : "Standard Terms Applied."}
                </Typography>
            </Box>
        </Stack>

        <Stack direction="row" justifyContent="space-between" mt={4}>
            <Box>
                <Typography variant="caption" color="text.secondary">Tenant Signature</Typography>
                {agreement.tenantSignature?.signedAt ? (
                    <Typography variant="h6" sx={{ fontFamily: 'Cursive', color: '#1976d2' }}>
                        {agreement.tenantId?.firstName} {agreement.tenantId?.lastName}
                    </Typography>
                ) : <Typography color="text.secondary">(Pending)</Typography>}
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary">Landlord Signature</Typography>
                {agreement.hostSignature?.signedAt ? (
                    <Typography variant="h6" sx={{ fontFamily: 'Cursive', color: '#1976d2' }}>
                        {agreement.hostId?.firstName} {agreement.hostId?.lastName}
                    </Typography>
                ) : <Typography color="text.secondary">(Pending)</Typography>}
            </Box>
        </Stack>
    </Paper>
);

export default AgreementPage;
