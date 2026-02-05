import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Avatar,
    Chip,
    Button,
    Divider,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Block, CheckCircle, Warning, AttachMoney, AccountBalanceWallet } from '@mui/icons-material';
import { fetchData, patchData, postData } from '../../config/apiServices/apiServices';
import { showSuccessToast, showErrorToast } from '../../components/toast/toast';
import Loader from '../../components/loader/loader';
import dayjs from 'dayjs';

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ bookings: [], payments: {}, transactions: [] });
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('REFUND'); // REFUND or CREDIT
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const data = await fetchData(`api/admin/users/${userId}`);
            if (data) {
                setUser(data.user);
                setStats({
                    bookings: data.bookings || [],
                    payments: data.payments || {},
                    transactions: data.transactions || []
                });
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            showErrorToast('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const handleStatusChange = async (status) => {
        if (!window.confirm(`Are you sure you want to ${status} this user?`)) return;

        try {
            // map action to endpoint
            let endpointSuffix = '';
            if (status === 'suspend') endpointSuffix = 'suspend';
            if (status === 'ban') endpointSuffix = 'ban';
            if (status === 'reactivate') endpointSuffix = 'reactivate';

            await patchData(`api/admin/users/${userId}/${endpointSuffix}`, {});
            showSuccessToast(`User ${status}ed successfully`);
            fetchUserDetails();
        } catch (error) {
            showErrorToast(`Failed to ${status} user`);
        }
    };

    const submitFinancial = async () => {
        if (!amount || !reason) return showErrorToast('Fill all fields');
        if (Number(amount) <= 0) return showErrorToast('Amount must be positive');

        setActionLoading(true);
        try {
            await postData(`api/admin/users/${userId}/${modalType === 'REFUND' ? 'refund' : 'credit'}`, { amount, reason });
            showSuccessToast('Transaction successful');
            setModalOpen(false);
            setAmount('');
            setReason('');
            fetchUserDetails();
        } catch (e) {
            // Error handled by api service
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <Loader open />;

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate('/admin/users')}>
                    <ArrowBack />
                </IconButton>
                <Avatar src={user?.photoProfile} sx={{ width: 64, height: 64 }}>U</Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4">{user?.userName}</Typography>
                    <Typography color="text.secondary">{user?.email}</Typography>
                </Box>
                <Chip
                    label={(user?.accountStatus || '').toUpperCase()}
                    color={user?.accountStatus === 'active' ? 'success' : user?.accountStatus === 'banned' ? 'error' : 'warning'}
                />

                {/* Actions */}
                {user?.accountStatus === 'active' && (
                    <Button variant="contained" color="warning" startIcon={<Block />} onClick={() => handleStatusChange('suspend')}>
                        Suspend
                    </Button>
                )}
                {user?.accountStatus === 'suspended' && (
                    <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleStatusChange('reactivate')}>
                        Reactivate
                    </Button>
                )}
                {user?.accountStatus !== 'banned' && (
                    <Button variant="contained" color="error" startIcon={<Warning />} onClick={() => handleStatusChange('ban')}>
                        Ban User
                    </Button>
                )}

                <Button variant="outlined" startIcon={<AttachMoney />} onClick={() => { setModalType('REFUND'); setModalOpen(true); }}>
                    Refund
                </Button>
                <Button variant="outlined" startIcon={<AccountBalanceWallet />} onClick={() => { setModalType('CREDIT'); setModalOpen(true); }}>
                    Credit
                </Button>
            </Stack>

            <Grid container spacing={4}>
                {/* Left Col: Info */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>User Details</Typography>
                        <Stack spacing={2}>
                            <Box><Typography variant="caption">Phone</Typography><Typography>{user?.phoneNumber || 'N/A'}</Typography></Box>
                            <Box><Typography variant="caption">Joined</Typography><Typography>{dayjs(user?.createdAt).format('MMM DD, YYYY')}</Typography></Box>
                            <Box><Typography variant="caption">Total Spend</Typography><Typography>${stats.payments?.totalSpend?.toLocaleString() || 0}</Typography></Box>
                            <Box><Typography variant="caption">Wallet Balance</Typography><Typography>${user?.walletBalance?.toLocaleString() || 0}</Typography></Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Col: Tabs */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ width: '100%', mb: 2 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary">
                            <Tab label="Bookings" />
                            <Tab label="Payments" />
                            <Tab label="Audit Log" />
                        </Tabs>
                        <Box sx={{ p: 3 }}>
                            {tabValue === 0 && (
                                <TableContainer>
                                    <Table>
                                        <TableHead><TableRow><TableCell>Listing</TableCell><TableCell>Dates</TableCell><TableCell>Status</TableCell><TableCell>Total</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {stats.bookings.map(b => (
                                                <TableRow key={b._id}>
                                                    <TableCell>{b.listingId?.title || 'Unknown Listing'}</TableCell>
                                                    <TableCell>{dayjs(b.startDate).format('MMM DD')} - {dayjs(b.endDate).format('MMM DD')}</TableCell>
                                                    <TableCell><Chip size="small" label={b.status} /></TableCell>
                                                    <TableCell>${b.totalPrice}</TableCell>
                                                </TableRow>
                                            ))}
                                            {stats.bookings.length === 0 && <TableRow><TableCell colSpan={4} align="center">No bookings</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                            {tabValue === 1 && (
                                <TableContainer>
                                    <Table>
                                        <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {(stats.payments.history || []).map(p => (
                                                <TableRow key={p._id}>
                                                    <TableCell>{dayjs(p.createdAt).format('MMM DD, YYYY HH:mm')}</TableCell>
                                                    <TableCell>${p.amount}</TableCell>
                                                    <TableCell>{p.paymentStatus}</TableCell>
                                                </TableRow>
                                            ))}
                                            {(stats.payments.history || []).length === 0 && <TableRow><TableCell colSpan={3} align="center">No payments</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                            {tabValue === 2 && (
                                <TableContainer>
                                    <Table>
                                        <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Action</TableCell><TableCell>Reason</TableCell><TableCell>Amount</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {stats.transactions.map(t => (
                                                <TableRow key={t._id}>
                                                    <TableCell>{dayjs(t.createdAt).format('MMM DD, YYYY')}</TableCell>
                                                    <TableCell><Chip size="small" label={t.action} /></TableCell>
                                                    <TableCell>{t.reason}</TableCell>
                                                    <TableCell>{t.amount ? `$${t.amount}` : '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                            {stats.transactions.length === 0 && <TableRow><TableCell colSpan={4} align="center">No transactions</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Financial Action Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>{modalType === 'REFUND' ? 'Issue Refund' : 'Issue Manual Credit'}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {modalType === 'REFUND' ? 'Refund amount will be added to user wallet.' : 'Credit will be added to user wallet.'}
                    </Typography>
                    <TextField
                        label="Amount"
                        type="number"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                    <TextField
                        label="Reason"
                        fullWidth
                        multiline
                        rows={2}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button onClick={submitFinancial} variant="contained" disabled={actionLoading}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserDetail;
