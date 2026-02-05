import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Chip,
    Button,
    Divider,
    Stack,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import {
    ArrowBack,
    VerifiedUser,
    Block,
    Warning,
    CheckCircle,
    Cancel,
    AttachMoney
} from '@mui/icons-material';
import { fetchData, patchData } from '../../config/apiServices/apiServices';
import Loader from '../../components/loader/loader';
import { showErrorToast, showSuccessToast } from '../../components/toast/toast';

const HostDetail = () => {
    const { hostId } = useParams();
    const navigate = useNavigate();
    const [hostData, setHostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [actionType, setActionType] = useState(null); // 'suspend', 'ban', 'reactivate', 'verify', 'reject'
    const [reason, setReason] = useState('');

    const fetchHostDetails = async () => {
        setLoading(true);
        try {
            const response = await fetchData(`api/admin/hosts/${hostId}`);
            setHostData(response);
        } catch (error) {
            console.error(error);
            showErrorToast("Failed to fetch host details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostDetails();
    }, [hostId]);

    const handleAction = async () => {
        try {
            let endpoint = '';
            let body = {};

            if (actionType === 'suspend') endpoint = `api/admin/hosts/${hostId}/suspend`;
            if (actionType === 'ban') endpoint = `api/admin/hosts/${hostId}/ban`;
            if (actionType === 'reactivate') endpoint = `api/admin/hosts/${hostId}/reactivate`;

            if (actionType === 'verify') {
                endpoint = `api/admin/hosts/${hostId}/verify`;
                body = { status: 'verified' };
            }
            if (actionType === 'reject') {
                endpoint = `api/admin/hosts/${hostId}/verify`;
                body = { status: 'rejected', rejectionReason: reason };
            }

            await patchData(endpoint, body);
            showSuccessToast(`Host ${actionType}ed successfully`);
            fetchHostDetails();
            setOpenConfirm(false);
        } catch (error) {
            showErrorToast(error.message);
        }
    };

    const openActionDialog = (type) => {
        setActionType(type);
        setOpenConfirm(true);
    };

    if (loading) return <Loader open />;
    if (!hostData) return <Box p={4}><Typography>Host not found</Typography></Box>;

    const { host, listings, earnings, complaints } = hostData;

    const getStatusColor = (status) => {
        if (status === 'active') return 'success';
        if (status === 'suspended') return 'warning';
        return 'error';
    };

    return (
        <Box sx={{ p: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/hosts')} sx={{ mb: 2 }}>
                Back to Hosts
            </Button>

            <Grid container spacing={4}>
                {/* Left Column: Profile & Actions */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Avatar src={host.photoProfile} sx={{ width: 100, height: 100, mb: 2 }} />
                            <Typography variant="h5" fontWeight="bold">{host.userName}</Typography>
                            <Typography color="textSecondary" gutterBottom>{host.email}</Typography>

                            <Stack direction="row" spacing={1} mt={1}>
                                <Chip
                                    label={(host.accountStatus?.toUpperCase() || 'ACTIVE')}
                                    color={getStatusColor(host.accountStatus || 'active')}
                                />
                                <Chip
                                    label={host.CNIC?.isVerified ? 'KYC VERIFIED' : 'KYC PENDING'}
                                    color={host.CNIC?.isVerified ? 'success' : 'default'}
                                    variant={host.CNIC?.isVerified ? 'filled' : 'outlined'}
                                />
                            </Stack>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                            <Typography gutterBottom>{host.phoneNumber || 'N/A'}</Typography>

                            <Typography variant="subtitle2" color="textSecondary">Joined</Typography>
                            <Typography gutterBottom>{new Date(host.createdAt).toLocaleDateString()}</Typography>

                            <Typography variant="subtitle2" color="textSecondary">Total Earnings</Typography>
                            <Typography variant="h6" color="primary">${earnings.toLocaleString()}</Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={2}>
                            {(host.accountStatus?.toLowerCase() || 'active') === 'active' && (
                                <>
                                    <Button variant="outlined" color="warning" startIcon={<Warning />} onClick={() => openActionDialog('suspend')}>
                                        Suspend Account
                                    </Button>
                                    <Button variant="outlined" color="error" startIcon={<Block />} onClick={() => openActionDialog('ban')}>
                                        Ban Account
                                    </Button>
                                </>
                            )}
                            {(host.accountStatus?.toLowerCase() === 'suspended') && (
                                <Button variant="contained" color="success" onClick={() => openActionDialog('reactivate')}>
                                    Reactivate Account
                                </Button>
                            )}
                            {(host.accountStatus?.toLowerCase() === 'banned') && (
                                <Button variant="contained" color="success" onClick={() => openActionDialog('reactivate')}>
                                    Unban Account
                                </Button>
                            )}
                        </Stack>
                    </Paper>

                    {/* KYC Section */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>KYC Verification</Typography>
                        {host.CNIC?.images?.length > 0 ? (
                            <Stack spacing={2}>
                                <Box display="flex" gap={1}>
                                    {host.CNIC.images.map((img, idx) => (
                                        <Box key={idx} component="img" src={img} sx={{ width: '100%', maxWidth: 150, borderRadius: 1 }} alt="CNIC" />
                                    ))}
                                </Box>
                                {!host.CNIC.isVerified && (
                                    <Stack direction="row" spacing={2}>
                                        <Button fullWidth variant="contained" color="success" onClick={() => openActionDialog('verify')}>
                                            Approve
                                        </Button>
                                        <Button fullWidth variant="outlined" color="error" onClick={() => openActionDialog('reject')}>
                                            Reject
                                        </Button>
                                    </Stack>
                                )}
                                {host.CNIC.isVerified && <Typography color="success.main" display="flex" alignItems="center"><CheckCircle sx={{ mr: 1 }} /> Verified</Typography>}
                            </Stack>
                        ) : (
                            <Typography color="textSecondary">No KYC documents uploaded.</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Right Column: Listings & Activities */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Listings ({listings.length})</Typography>
                        {listings.length === 0 ? (
                            <Typography>No listings found.</Typography>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {listings.map(listing => (
                                        <TableRow key={listing._id}>
                                            <TableCell>{listing.title}</TableCell>
                                            <TableCell>{listing.category}</TableCell>
                                            <TableCell>${listing.price}</TableCell>
                                            <TableCell>
                                                <Chip label="Active" color="success" size="small" />
                                                {/* Defaulting to Active as status field is unknown but listed */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>

                    {/* Complaints Section (Placeholder) */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Complaints ({complaints.length})</Typography>
                        {complaints.length === 0 ? (
                            <Typography color="textSecondary">No complaints reported.</Typography>
                        ) : (
                            <Box>Complaint list...</Box>
                        )}
                    </Paper>

                </Grid>
            </Grid>

            {/* Confirmation Dialog */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to <b>{actionType}</b> this host?</Typography>
                    {actionType === 'reject' && (
                        <TextField
                            label="Rejection Reason"
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mt: 2 }}
                            value={reason} onChange={(e) => setReason(e.target.value)}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
                    <Button onClick={handleAction} color={actionType === 'ban' || actionType === 'reject' ? 'error' : 'primary'} variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HostDetail;
