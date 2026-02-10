import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Avatar,
    Skeleton,
    Stack,
    Divider,
    Paper,
    Grid,
    Chip,
    Pagination,
} from "@mui/material";
import {
    FaShieldAlt,
    FaStar,
    FaHome,
    FaCheckCircle,
    FaCalendarAlt,
    FaEnvelope,
} from "react-icons/fa";
import { getHostProfile } from "../../services/profileService";
import CardItem from "../../components/cards/cards";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/backButton/backButton";

const HostProfile = () => {
    const { hostId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [reviewsPage, setReviewsPage] = useState(1);
    const REVIEWS_PER_PAGE = 4;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getHostProfile(hostId);
                setProfile(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [hostId]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 4 }}>
                            <Skeleton variant="circular" width={120} height={120} />
                            <Skeleton height={32} sx={{ mt: 2 }} />
                            <Skeleton height={20} width="60%" />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Skeleton height={40} />
                        <Skeleton height={120} sx={{ mt: 2 }} />
                        <Skeleton height={300} sx={{ mt: 3 }} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (error || !profile) {
        return (
            <Container sx={{ py: 8, textAlign: "center" }}>
                <Typography variant="h5" fontWeight={800}>
                    User not found
                </Typography>
            </Container>
        );
    }

    const paginatedReviews = profile.reviews.slice(
        (reviewsPage - 1) * REVIEWS_PER_PAGE,
        reviewsPage * REVIEWS_PER_PAGE
    );

    const totalReviewPages = Math.ceil(
        profile.reviews.length / REVIEWS_PER_PAGE
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <BackButton />
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                            position: "sticky",
                            top: 90,
                        }}
                    >
                        <Stack spacing={2} alignItems="center">
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    src={profile.photoProfile}
                                    alt={profile.userName}
                                    sx={{ width: 120, height: 120 }}
                                />
                                {profile.isVerified && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: "background.paper",
                                            borderRadius: "50%",
                                            p: 0.6,
                                        }}
                                    >
                                        <FaShieldAlt color="#ff385c" />
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="h5" fontWeight={900}>
                                {profile.userName}
                            </Typography>
                            <Typography variant="body2" color="var(--text-color)">
                                Joined in {new Date(profile.joinedDate).getFullYear()}
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                                {profile.isVerified && (
                                    <Chip
                                        icon={<FaCheckCircle />}
                                        label="Identity Verified"
                                        color="success"
                                        variant="outlined"
                                    />
                                )}
                                <Chip icon={<FaEnvelope />} label="Email Verified" variant="outlined" sx={{ color: "var(--primary-color)" }} />
                            </Stack>

                            <Divider sx={{ my: 2, width: "100%" }} />

                            <Grid container spacing={2} textAlign="center">
                                <Grid item xs={4}>
                                    <Typography fontWeight={900}>
                                        {profile.stats.reviewsCount}
                                    </Typography>
                                    <Typography variant="caption">Reviews</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography fontWeight={900}>
                                        {profile.stats.averageRating}
                                    </Typography>
                                    <Typography variant="caption">Rating</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography fontWeight={900}>
                                        {profile.listings.length}
                                    </Typography>
                                    <Typography variant="caption">Listings</Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Paper>
                </Grid>

                {/* ================= MAIN CONTENT ================= */}
                <Grid item xs={12} md={8}>
                    {/* ABOUT */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                            mb: 4,
                        }}
                    >
                        <Typography variant="h6" fontWeight={900} gutterBottom>
                            About {profile.userName}
                        </Typography>
                        <Typography color="var(--text-color)">{profile.bio}</Typography>

                        <Grid container spacing={3} sx={{ mt: 3 }}>
                            <Grid item xs={4} sm={4} textAlign="center">
                                <FaHome size={22} />
                                <Typography fontWeight={900}>
                                    {profile.stats.totalBookings}
                                </Typography>
                                <Typography variant="caption">Bookings</Typography>
                            </Grid>
                            <Grid item xs={4} sm={4} textAlign="center">
                                <FaStar size={22} />
                                <Typography fontWeight={900}>
                                    {profile.stats.responseRate}
                                </Typography>
                                <Typography variant="caption">Response Rate</Typography>
                            </Grid>
                            <Grid item xs={4} sm={4} textAlign="center">
                                <FaCalendarAlt size={22} />
                                <Typography fontWeight={900}>Active</Typography>
                                <Typography variant="caption">
                                    Responds {profile.stats.responseTime}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* LISTINGS */}
                    {profile.listings?.length > 0 && (
                        <Box sx={{ mb: 5 }}>
                            <Typography variant="h6" fontWeight={900} gutterBottom>
                                Listings by {profile.userName}
                            </Typography>
                            <Grid container spacing={3}>
                                {profile.listings.map((listing) => (
                                    <Grid item xs={6} sm={6} key={listing._id}>
                                        <CardItem data={listing} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* REVIEWS */}
                    {profile.reviews?.length > 0 && (
                        <Box>
                            <Typography variant="h6" fontWeight={900} gutterBottom>
                                Reviews ({profile.reviews.length})
                            </Typography>

                            <Grid container spacing={3}>
                                {paginatedReviews.map((review) => (
                                    <Grid item xs={12} sm={6} key={review._id}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 3,
                                                border: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={review.guest.photoProfile}
                                                    alt={review.guest.userName}
                                                />
                                                <Box>
                                                    <Typography fontWeight={800}>
                                                        {review.guest.userName}
                                                    </Typography>
                                                    <Typography variant="caption" color="var(--text-color)">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Typography
                                                sx={{ mt: 2 }}
                                                color="var(--text-color)"
                                                variant="body2"
                                            >
                                                {review.comment}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                            {totalReviewPages > 1 && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                                    <Pagination
                                        count={totalReviewPages}
                                        page={reviewsPage}
                                        onChange={(e, value) => setReviewsPage(value)}
                                        shape="rounded"
                                        size="small"
                                        sx={{
                                            "& .MuiPaginationItem-root": {
                                                color: "var(--text-primary)",
                                                border: "1px solid var(--border-light)",
                                                fontWeight: 700,
                                            },
                                            "& .Mui-selected": {
                                                backgroundColor: "var(--primary) !important",
                                                color: "#fff",
                                                borderColor: "var(--primary)",
                                            },
                                            "& .MuiPaginationItem-root:hover": {
                                                backgroundColor: "var(--bg-secondary)",
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default HostProfile;
