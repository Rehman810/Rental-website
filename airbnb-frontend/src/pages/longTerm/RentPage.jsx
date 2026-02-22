import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { getAuthToken } from '../../utils/cookieUtils';
import apiClient from '../../config/ServiceApi/apiClient';
import { API_BASE_URL } from '../../config/env';

const RentPage = () => {
    const { agreementId } = useParams();
    const token = getAuthToken();
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await apiClient.get(`${API_BASE_URL}/long-term/payments/${agreementId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPayments();
    }, [agreementId]);

    const getStatusColor = (status) => {
        if (status === 'paid') return 'success';
        if (status === 'overdue') return 'error';
        return 'warning';
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1000, mx: "auto", mt: 2 }}>
            <Typography variant="h4" fontWeight={900} gutterBottom>Rent Payments</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                            <TableCell><b>Due Date</b></TableCell>
                            <TableCell><b>Month</b></TableCell>
                            <TableCell><b>Amount</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Action</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No payment schedule found.</TableCell>
                            </TableRow>
                        ) : (
                            payments.map((p) => (
                                <TableRow key={p._id}>
                                    <TableCell>{new Date(p.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{p.month}/{p.year}</TableCell>
                                    <TableCell>Rs {p.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip label={p.status.toUpperCase()} color={getStatusColor(p.status)} size="small" sx={{ fontWeight: 800 }} />
                                    </TableCell>
                                    <TableCell>
                                        {p.status === 'pending' && (
                                            <Button variant="outlined" size="small" sx={{ textTransform: 'none', fontWeight: 800 }}>
                                                Pay Now
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RentPage;
