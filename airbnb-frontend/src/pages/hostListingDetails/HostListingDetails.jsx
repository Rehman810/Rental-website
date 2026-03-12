import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hostListingApi } from '../../services/hostListingService';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Skeleton,
    Divider,
    Stack,
    useTheme,
    Dialog,
    DialogContent,
    IconButton
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HotelIcon from '@mui/icons-material/Hotel';
import CloseIcon from '@mui/icons-material/Close';

import usePageTitle from "../../hooks/usePageTitle";
import { CURRENCY } from '../../config/env';
import BackButton from '../../components/backButton/backButton';
import Amenities from '../../components/amenities/amenities';
import { useMediaQuery } from "@mui/material";

const HostListingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:1100px)");
    const [listing, setListing] = useState(null);
    const [openAmenitiesModal, setOpenAmenitiesModal] = useState(false);
    usePageTitle(listing?.title || "Listing Details");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await hostListingApi.getById(id);
                setListing(data);
            } catch (err) {
                console.error('Failed to load listing', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <Box p={4} maxWidth="1200px" mx="auto">
                <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3 }} />
                <Skeleton height={48} width="60%" sx={{ mt: 3 }} />
                <Skeleton height={24} width="40%" />
            </Box>
        );
    }

    if (!listing) {
        return <Typography p={4}>Listing not found</Typography>;
    }


    return (
        <Box p={{ xs: 2, md: 4 }} maxWidth="1200px" mx="auto">
            <BackButton />
            {/* Header */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
                mb={4}
            >
                <Box>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900}>
                        {listing.title}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1} alignItems="center">
                        <LocationOnIcon fontSize="small" color="var(--text-color)" />
                        <Typography variant="body2" color="">
                            {listing.city}, Pakistan
                        </Typography>
                    </Stack>
                </Box>

                <Button
                    startIcon={<EditIcon fontSize="small" />}
                    onClick={() => navigate(`/hosting/listings/${id}/edit`)}
                    sx={{
                        px: 2.8,
                        py: 1,
                        borderRadius: 3,
                        fontWeight: 800,
                        textTransform: "none",
                        color: "var(--text-primary)",
                        background:
                            "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(25,118,210,0.04))",
                        border: "1px solid rgba(25,118,210,0.25)",
                        boxShadow: "0 6px 18px rgba(25,118,210,0.15)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                            background:
                                "linear-gradient(135deg, rgba(25,118,210,0.18), rgba(25,118,210,0.08))",
                            boxShadow: "0 10px 28px rgba(25,118,210,0.25)",
                            transform: "translateY(-1px)",
                        },
                        "&:active": {
                            transform: "translateY(0)",
                            boxShadow: "0 4px 12px rgba(25,118,210,0.18)",
                        },
                    }}
                >
                    Edit listing
                </Button>
            </Stack>

            {/* Image Gallery */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                    gap: 1.5,
                    borderRadius: 4,
                    overflow: 'hidden',
                    mb: 5
                }}
            >
                <Box
                    sx={{
                        height: { xs: 260, md: 420 },
                        backgroundImage: `url(${listing.photos?.[0]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <Stack spacing={1.5}>
                    {listing.photos?.slice(1, 3).map((photo, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                flex: 1,
                                backgroundImage: `url(${photo})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            <Grid container spacing={4}>
                {/* LEFT CONTENT */}
                <Grid item xs={12} md={8}>
                    {/* Description */}
                    <Box mb={4}>
                        <Typography variant="h6" fontWeight={800} gutterBottom>
                            About this place
                        </Typography>
                        <Typography
                            variant="body1"
                            color=""
                            sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
                        >
                            {listing.description}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {/* Amenities */}
                    <Box mt={4}>
                        {/* Header */}
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    What this place offers
                                </Typography>
                                <Typography variant="body2" color="">
                                    Amenities included with your stay
                                </Typography>
                            </Box>

                            {listing?.amenities?.length > 6 && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setOpenAmenitiesModal(true)}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 900,
                                    }}
                                >
                                    Show all
                                </Button>
                            )}
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Amenities backendAmenities={listing?.amenities} variant="card" limit={6} />
                    </Box>
                </Grid>

                {/* RIGHT SIDEBAR */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            position: 'sticky',
                            top: 90,
                            borderRadius: 4,
                            backdropFilter: 'blur(14px)',
                            background:
                                theme.palette.mode === 'dark'
                                    ? 'rgba(30,30,30,0.75)'
                                    : 'rgba(255,255,255,0.9)',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <CardContent>
                            {/* Price */}
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <Typography variant="h5" fontWeight={900}>
                                    {CURRENCY} {listing.weekdayPrice}
                                </Typography>
                                <Typography variant="body2" color="var(--text-secondary)">
                                    / night
                                </Typography>
                            </Stack>

                            <Chip
                                label={
                                    listing.bookingMode === 'instant'
                                        ? 'Instant Book'
                                        : 'Request to Book'
                                }
                                color={
                                    listing.bookingMode === 'instant' ? 'success' : 'warning'
                                }
                                sx={{
                                    mb: 3,
                                    fontWeight: 700,
                                    borderRadius: 2
                                }}
                            />

                            <Divider sx={{ mb: 2 }} />

                            {/* Capacity */}
                            <Stack spacing={1.2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <HotelIcon fontSize="small" color="action" sx={{ color: 'var(--text-secondary)' }} />
                                    <Typography variant="body2">
                                        {listing.guestCapacity} guests · {listing.bedrooms} bedrooms ·{' '}
                                        {listing.beds} beds
                                    </Typography>
                                </Stack>

                                <Typography variant="body2" color="">
                                    Bathrooms: {listing.bathrooms}
                                </Typography>
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            {/* Rules */}
                            <Typography variant="overline" color="">
                                Stay rules
                            </Typography>
                            <Typography variant="body2">
                                Min nights: {listing.minNights || 1}
                            </Typography>
                            <Typography variant="body2">
                                Max nights: {listing.maxNights || 30}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Amenities Modal */}
            <Dialog
                open={openAmenitiesModal}
                onClose={() => setOpenAmenitiesModal(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 0.5,
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Amenities</Typography>
                    <IconButton onClick={() => setOpenAmenitiesModal(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                <DialogContent>
                   <Amenities backendAmenities={listing?.amenities} variant="card" />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default HostListingDetails;
