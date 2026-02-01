import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box,
    Typography,
    Avatar,
    Grid,
    LinearProgress,
    Button,
    Pagination,
    Paper,
    Divider,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Chip,
    Skeleton,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import ReplyIcon from "@mui/icons-material/Reply";
import toast from "react-hot-toast";
import { getListingReviews, respondToReview } from "../../config/ServiceApi/serviceApi";

/* ----------------------------- Helpers ----------------------------- */

const formatNumber = (num, digits = 1) => {
    if (num === null || num === undefined || isNaN(Number(num))) return "0.0";
    return Number(num).toFixed(digits);
};

const RatingPill = ({ value }) => {
    const safeValue = Number(value || 0);
    return (
        <Chip
            icon={<StarIcon sx={{ fontSize: 18 }} />}
            label={formatNumber(safeValue, 1)}
            size="small"
            sx={{
                borderRadius: 2,
                fontWeight: 900,
                bgcolor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                px: 0.5,
            }}
        />
    );
};

const ReviewBar = ({ label, value }) => {
    const safeValue = Number(value || 0);
    const percent = Math.min(100, Math.max(0, (safeValue / 5) * 100));

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
                sx={{
                    minWidth: 140,
                    fontSize: "0.92rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                }}
            >
                {label}
            </Typography>

            <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                        height: 8,
                        borderRadius: 10,
                        bgcolor: "var(--bg-tertiary)",

                        "& .MuiLinearProgress-bar": {
                            borderRadius: 10,
                            backgroundColor: "var(--primary)",
                        },
                    }}
                />
            </Box>

            <Typography sx={{ width: 42, textAlign: "right", fontWeight: 900 }}>
                {formatNumber(safeValue, 1)}
            </Typography>
        </Box>
    );
};

/* ----------------------------- Component ----------------------------- */

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
    const [responseText, setResponseText] = useState("");
    const [submittingResponse, setSubmittingResponse] = useState(false);

    const isHost = useMemo(() => {
        return currentUser && listingHostId && currentUser._id === listingHostId;
    }, [currentUser, listingHostId]);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getListingReviews(listingId, page);

            setReviews(data?.reviews || []);
            setTotalPages(data?.totalPages || 1);
            setTotalReviews(data?.totalReviews || 0);
            setStats(data?.listingStats || null);
        } catch (error) {
            console.error(error);
            // toast.error("Failed to load reviews");
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
        setResponseText("");
        setResponseModalOpen(true);
    };

    const handleSubmitResponse = async () => {
        if (!responseText.trim()) return;

        setSubmittingResponse(true);
        try {
            const token = localStorage.getItem("token");
            await respondToReview(activeReviewId, responseText, token);

            toast.success("Response posted");
            setResponseModalOpen(false);
            fetchReviews();
        } catch (error) {
            toast.error("Failed to post response");
        } finally {
            setSubmittingResponse(false);
        }
    };

    /**
     * Requirements logic:
     * - Bars only show if required (your ask)
     * You can adjust these keys based on your backend.
     */
    const reqs = stats?.effectiveGuestRequirements || stats?.guestRequirements || null;

    const ratingAvg = stats?.ratingAvg || 0;
    const ratingDetails = stats?.ratingDetails || {};

    // Only show bar if required (strict)
    const showCleanliness = reqs?.requireCleanlinessRating === true || reqs?.requireRatings === true;
    const showCommunication = reqs?.requireCommunicationRating === true || reqs?.requireRatings === true;
    const showLocation = reqs?.requireLocationRating === true || reqs?.requireRatings === true;
    const showValue = reqs?.requireValueRating === true || reqs?.requireRatings === true;

    // If requirements object not present, fallback: show if stats exists
    const showFallbackBars = !reqs;

    const showAnyBar =
        showFallbackBars ||
        showCleanliness ||
        showCommunication ||
        showLocation ||
        showValue;

    return (
        <Box sx={{ py: 4 }}>
            {/* Header Summary */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 3,
                    background:
                        "linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))",
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.5}
                >
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                            Reviews
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.8 }}>
                            <RatingPill value={ratingAvg} />
                            <Typography variant="body2" color="var(--text-secondary)" sx={{ fontWeight: 700 }}>
                                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                            </Typography>
                            {ratingAvg > 0 && (
                                <Chip
                                    icon={<VerifiedIcon sx={{ fontSize: 18 }} />}
                                    label="Verified stays"
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 800,
                                        bgcolor: "rgba(46,125,50,0.10)",
                                        color: "success.main",
                                    }}
                                />
                            )}
                        </Stack>
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                        <Typography variant="body2" color="var(--text-secondary)" sx={{ fontWeight: 700 }}>
                            Overall rating
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.3 }}>
                            {ratingAvg ? `${formatNumber(ratingAvg, 1)} / 5.0` : "New listing"}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Rating Breakdown */}
            {stats && showAnyBar && (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        mb: 3,
                    }}
                >
                    <Stack spacing={1.6}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 0.5 }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                Rating breakdown
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="var(--text-secondary)" sx={{ fontWeight: 700 }}>
                                    Average
                                </Typography>
                                <RatingPill value={ratingAvg} />
                            </Stack>
                        </Stack>

                        <Divider />

                        <Grid container spacing={2.2}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={1.4}>
                                    {(showFallbackBars || showCleanliness) && (
                                        <ReviewBar label="Cleanliness" value={ratingDetails.cleanliness} />
                                    )}
                                    {(showFallbackBars || showCommunication) && (
                                        <ReviewBar label="Communication" value={ratingDetails.communication} />
                                    )}
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Stack spacing={1.4}>
                                    {(showFallbackBars || showLocation) && (
                                        <ReviewBar label="Location / Check-in" value={ratingDetails.location} />
                                    )}
                                    {(showFallbackBars || showValue) && (
                                        <ReviewBar label="Value" value={ratingDetails.value} />
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Stack>
                </Paper>
            )}

            {/* Reviews List */}
            <Stack spacing={2}>
                {loading && reviews.length === 0 ? (
                    <>
                        {[1, 2, 3].map((x) => (
                            <Paper
                                key={x}
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Skeleton variant="circular" width={48} height={48} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Skeleton width="40%" height={22} />
                                        <Skeleton width="25%" height={18} />
                                    </Box>
                                </Stack>
                                <Skeleton sx={{ mt: 2 }} height={60} />
                            </Paper>
                        ))}
                    </>
                ) : reviews.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            textAlign: "center",
                        }}
                    >
                        <Typography sx={{ fontWeight: 900 }}>No reviews yet</Typography>
                        <Typography variant="body2" color="" sx={{ mt: 0.6 }}>
                            Be the first to share your experience.
                        </Typography>
                    </Paper>
                ) : (
                    reviews.map((review) => {
                        const guestName = review?.guestId?.userName || "Guest";
                        const guestPhoto = review?.guestId?.photoProfile || "";
                        const createdAt = review?.createdAt
                            ? new Date(review.createdAt).toLocaleDateString()
                            : "";

                        // If your review has its own ratings per review, show it:
                        const perReviewOverall =
                            review?.ratings?.overall ||
                            review?.overallRating ||
                            null;

                        return (
                            <Paper
                                key={review._id}
                                elevation={0}
                                sx={{
                                    p: { xs: 2, md: 2.5 },
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    transition: "all 0.18s ease",
                                    "&:hover": {
                                        boxShadow: "var(--shadow-md)",
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            >
                                {/* Header */}
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Avatar
                                        src={guestPhoto}
                                        alt={guestName}
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    />

                                    <Box sx={{ flexGrow: 1 }}>
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                            justifyContent="space-between"
                                            spacing={1}
                                        >
                                            <Box>
                                                <Typography sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
                                                    {guestName}
                                                </Typography>
                                                <Typography variant="caption" color="var(--text-secondary)" sx={{ fontWeight: 700 }}>
                                                    {createdAt}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {perReviewOverall && (
                                                    <Chip
                                                        icon={<StarIcon sx={{ fontSize: 18 }} color="var(--text-primary)" />}
                                                        label={`${formatNumber(perReviewOverall, 1)} / 5`}
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 2,
                                                            fontWeight: 900,
                                                            bgcolor: "var(--bg-secondary)",
                                                            color: "var(--text-primary)",
                                                        }}
                                                    />
                                                )}

                                                {isHost && !review?.hostResponse && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<ReplyIcon />}
                                                        onClick={() => openResponseModal(review._id)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontWeight: 900,
                                                        }}
                                                    >
                                                        Reply
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Stack>

                                        {/* Comment */}
                                        <Typography sx={{ mt: 1.4, fontSize: "0.98rem", lineHeight: 1.65 }}>
                                            {review?.comment || "—"}
                                        </Typography>

                                        {/* Photos */}
                                        {review?.photos?.length > 0 && (
                                            <Stack direction="row" spacing={1.2} sx={{ mt: 1.6, flexWrap: "wrap" }}>
                                                {review.photos.map((photo, index) => (
                                                    <Box
                                                        key={index}
                                                        onClick={() => window.open(photo, "_blank")}
                                                        sx={{
                                                            width: 112,
                                                            height: 86,
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            cursor: "pointer",
                                                            "&:hover": {
                                                                transform: "translateY(-1px)",
                                                                boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
                                                            },
                                                            transition: "all 0.18s ease",
                                                        }}
                                                    >
                                                        <img
                                                            src={photo}
                                                            alt="Review"
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}

                                        {/* Host Response */}
                                        {review?.hostResponse?.message && (
                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    p: 2,
                                                    borderRadius: 2.5,
                                                    border: "1px solid",
                                                    bgcolor: "var(--bg-secondary)",
                                                    borderColor: "var(--border-light)",
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                                                    <VerifiedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                                                    <Typography sx={{ fontWeight: 900 }}>
                                                        Host response
                                                    </Typography>
                                                </Stack>

                                                <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                                                    {review.hostResponse.message}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="var(--text-secondary)"
                                                    sx={{ display: "block", mt: 0.8, fontWeight: 700 }}
                                                >
                                                    {review.hostResponse.respondedAt
                                                        ? new Date(review.hostResponse.respondedAt).toLocaleDateString()
                                                        : ""}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Stack>
                            </Paper>
                        );
                    })
                )}
            </Stack>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                </Box>
            )}

            {/* Host Response Dialog */}
            <Dialog
                open={responseModalOpen}
                onClose={() => setResponseModalOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 900 }}>Reply to Review</DialogTitle>

                <DialogContent>
                    <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 1.2 }}>
                        Keep it professional. This response will be visible to guests.
                    </Typography>

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

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setResponseModalOpen(false)}
                        sx={{ textTransform: "none", fontWeight: 900 }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmitResponse}
                        variant="contained"
                        disabled={submittingResponse || !responseText.trim()}
                        sx={{ textTransform: "none", fontWeight: 900, borderRadius: 2 }}
                    >
                        {submittingResponse ? "Posting..." : "Post Reply"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewsSection;
