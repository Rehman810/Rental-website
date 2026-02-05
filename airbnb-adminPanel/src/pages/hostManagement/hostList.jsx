import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Pagination,
    Stack,
    Divider
} from '@mui/material';
import {
    Visibility,
    Search
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../../config/apiServices/apiServices';
import Loader from '../../components/loader/loader';

const HostList = () => {
    const navigate = useNavigate();
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [accountStatus, setAccountStatus] = useState('');
    const [kycStatus, setKycStatus] = useState('');

    const fetchHosts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit: 10,
                search,
                accountStatus,
                kycStatus
            }).toString();

            const response = await fetchData(`api/admin/hosts?${query}`);
            if (response?.hosts) {
                setHosts(response.hosts);
                setTotalPages(Math.ceil(response.totalCount / 10));
            }
        } catch (error) {
            console.error('Failed to fetch hosts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchHosts, 400);
        return () => clearTimeout(t);
    }, [page, search, accountStatus, kycStatus]);

    const statusColor = (status) => {
        if (status === 'active') return 'success';
        if (status === 'suspended') return 'warning';
        if (status === 'banned') return 'error';
        return 'default';
    };

    return (
        <Box sx={{ p: 4 }}>
            {/* PAGE HEADER */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>
                    Host Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Monitor, review and manage platform hosts
                </Typography>
            </Box>

            {/* FILTER BAR */}
            <Paper
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search by name or email"
                        size="small"
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Account Status</InputLabel>
                        <Select
                            value={accountStatus}
                            label="Account Status"
                            onChange={(e) => setAccountStatus(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                            <MenuItem value="banned">Banned</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>KYC Status</InputLabel>
                        <Select
                            value={kycStatus}
                            label="KYC Status"
                            onChange={(e) => setKycStatus(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* TABLE */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Host</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>KYC</TableCell>
                            <TableCell align="center">Listings</TableCell>
                            <TableCell align="right">Earnings</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Loader open />
                                </TableCell>
                            </TableRow>
                        ) : hosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        No hosts found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            hosts.map((host) => (
                                <TableRow
                                    key={host._id}
                                    hover
                                    sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
                                >
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={host.photoProfile}>
                                                {host.userName?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={600}>
                                                    {host.userName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {host._id.slice(-6)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">{host.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {host.phoneNumber || 'N/A'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={(host.accountStatus || 'active').toUpperCase()}
                                            color={statusColor(host.accountStatus)}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            size="small"
                                            variant={host.CNIC?.isVerified ? 'filled' : 'outlined'}
                                            color={host.CNIC?.isVerified ? 'success' : 'default'}
                                            label={host.CNIC?.isVerified ? 'VERIFIED' : 'PENDING'}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        {host.totalListings || 0}
                                    </TableCell>

                                    <TableCell align="right">
                                        ${Number(host.totalEarnings || 0).toLocaleString()}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Tooltip title="View Host Details">
                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    navigate(`/admin/hosts/${host._id}`)
                                                }
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PAGINATION */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, v) => setPage(v)}
                    color="primary"
                    shape="rounded"
                />
            </Box>
        </Box>
    );
};

export default HostList;
