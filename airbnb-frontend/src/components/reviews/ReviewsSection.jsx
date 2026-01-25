import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Avatar, Grid, LinearProgress, Button,
    Pagination, Paper, Divider, Stack, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions, Chip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import { getListingReviews, respondToReview } from '../../config/ServiceApi/serviceApi';
import toast from 'react-hot-toast';

const ReviewBar = ({ label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ minWidth: 120, fontSize: '0.9rem' }}>{label}</Typography>
        <Box sx={{ flexGrow: 1, mx: 2 }}>
            <LinearProgress variant="determinate" value={(value / 5) * 100} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{value}</Typography>
    </Box>
);

const ReviewsSection = ({ listingId, currentUser, listingHostId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(false);

    // Host Response State
    const [responseModalOpen, setResponseModalOpen] = useState(false);
    const [activeReviewId, setActiveReviewId] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getListingReviews(listingId, page);
            console.log(data);
            setReviews(data.reviews);
            setTotalPages(data.totalPages);
            setTotalReviews(data.totalReviews);
            setStats(data.listingStats);
        } catch (error) {
            console.error(error);
            // toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [listingId, page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const openResponseModal = (reviewId) => {
        setActiveReviewId(reviewId);
        setResponseText('');
        setResponseModalOpen(true);
    };

    const handleSubmitResponse = async () => {
        if (!responseText.trim()) return;
        setSubmittingResponse(true);
        try {
            const user = localStorage.getItem('token');
            await respondToReview(activeReviewId, responseText, user);
            toast.success('Response posted');
            setResponseModalOpen(false);
            fetchReviews(); // Refresh
        } catch (error) {
            toast.error('Failed to post response');
        } finally {
            setSubmittingResponse(false);
        }
    };

    const isHost = currentUser && listingHostId && currentUser._id === listingHostId;

    if (loading && reviews.length === 0) return <Typography>Loading reviews...</Typography>;

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                ★ {stats?.ratingAvg || 'New'} · {totalReviews} Reviews
            </Typography>

            {stats && stats.ratingDetails && (
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <ReviewBar label="Cleanliness" value={stats.ratingDetails.cleanliness} />
                        <ReviewBar label="Communication" value={stats.ratingDetails.communication} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ReviewBar label="Check-in/Location" value={stats.ratingDetails.location} />
                        <ReviewBar label="Value" value={stats.ratingDetails.value} />
                    </Grid>
                </Grid>
            )}

            <Stack spacing={3}>
                {reviews.map((review) => (
                    <Paper key={review._id} elevation={0} sx={{ p: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar src={review.guestId?.photoProfile} alt={review.guestId?.userName} sx={{ width: 48, height: 48, mr: 2 }} />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {review.guestId?.userName || 'Guest'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1">{review.comment}</Typography>
                        </Box>

                        {review.photos && review.photos.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                {review.photos.map((photo, index) => (
                                    <img
                                        key={index}
                                        src={photo}
                                        alt="Review"
                                        style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                                        onClick={() => window.open(photo, '_blank')}
                                    />
                                ))}
                            </Box>
                        )}

                        {review.hostResponse && review.hostResponse.message && (
                            <Box sx={{ ml: 4, pl: 2, borderLeft: '3px solid #ddd', mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Response from Host:</Typography>
                                <Typography variant="body2">{review.hostResponse.message}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(review.hostResponse.respondedAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        )}

                        {isHost && !review.hostResponse && (
                            <Button size="small" onClick={() => openResponseModal(review._id)} sx={{ mt: 1 }}>
                                Reply
                            </Button>
                        )}
                        <Divider sx={{ mt: 3 }} />
                    </Paper>
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                </Box>
            )}

            {/* Host Response Dialog */}
            <Dialog open={responseModalOpen} onClose={() => setResponseModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Reply to Review</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Response"
                        fullWidth
                        multiline
                        rows={4}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResponseModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitResponse} variant="contained" disabled={submittingResponse}>
                        {submittingResponse ? 'Posting...' : 'Post Reply'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewsSection;
