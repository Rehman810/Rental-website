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

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [accountStatus, setAccountStatus] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit: 10,
                search,
                status: accountStatus, // sending 'status' as param
            }).toString();

            const response = await fetchData(`api/admin/users?${query}`);
            if (response?.users) {
                setUsers(response.users);
                setTotalPages(response.totalPages || Math.ceil(response.totalCount / 10));
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchUsers, 400);
        return () => clearTimeout(t);
    }, [page, search, accountStatus]);

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
                    User Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage guest users, view bookings, and handle account actions
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
                            <TableCell>User</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Bookings</TableCell>
                            <TableCell align="right">Total Spend</TableCell>
                            <TableCell align="right">Wallet Bal</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Loader open={false} /> {/* Assuming Loader has internal loading state or we should treat it differently. The original code used <Loader open /> inside. */}
                                    <Typography variant="body2">Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        No users found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow
                                    key={user._id}
                                    hover
                                    sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
                                >
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={user.photoProfile}>
                                                {user.userName?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={600}>
                                                    {user.userName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {user._id.slice(-6)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">{user.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {user.phoneNumber || 'N/A'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={(user.accountStatus || 'active').toUpperCase()}
                                            color={statusColor(user.accountStatus)}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        {user.totalBookings || 0}
                                    </TableCell>

                                    <TableCell align="right">
                                        ${Number(user.totalSpend || 0).toLocaleString()}
                                    </TableCell>

                                    <TableCell align="right">
                                        ${Number(user.walletBalance || 0).toLocaleString()}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Tooltip title="View Details">
                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    navigate(`/admin/users/${user._id}`)
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

export default UserList;
