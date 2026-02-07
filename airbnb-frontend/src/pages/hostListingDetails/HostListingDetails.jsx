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
    useTheme
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HotelIcon from '@mui/icons-material/Hotel';
import WifiIcon from "@mui/icons-material/Wifi";
import TvIcon from "@mui/icons-material/Tv";
import KitchenIcon from "@mui/icons-material/Kitchen";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PoolIcon from "@mui/icons-material/Pool";
import HotTubIcon from "@mui/icons-material/HotTub";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import BalconyIcon from "@mui/icons-material/Balcony";
import ElevatorIcon from "@mui/icons-material/Elevator";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SecurityIcon from "@mui/icons-material/Security";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PetsIcon from "@mui/icons-material/Pets";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import WorkIcon from "@mui/icons-material/Work";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MicrowaveIcon from "@mui/icons-material/Microwave";
import CoffeeIcon from "@mui/icons-material/Coffee";
import BathtubIcon from "@mui/icons-material/Bathtub";
import { CheckCircleOutline } from '@mui/icons-material';
import usePageTitle from "../../hooks/usePageTitle";
import { CURRENCY } from '../../config/env';

const HostListingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const [listing, setListing] = useState(null);
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

    const AMENITY_ICONS = {
        wifi: <WifiIcon fontSize="small" />,
        tv: <TvIcon fontSize="small" />,
        kitchen: <KitchenIcon fontSize="small" />,
        parking: <LocalParkingIcon fontSize="small" />,
        "air conditioning": <AcUnitIcon fontSize="small" />,
        gym: <FitnessCenterIcon fontSize="small" />,
        pool: <PoolIcon fontSize="small" />,
        "hot tub": <HotTubIcon fontSize="small" />,
        washer: <LocalLaundryServiceIcon fontSize="small" />,
        dryer: <LocalLaundryServiceIcon fontSize="small" />,
        balcony: <BalconyIcon fontSize="small" />,
        elevator: <ElevatorIcon fontSize="small" />,
        heating: <LocalFireDepartmentIcon fontSize="small" />,
        security: <SecurityIcon fontSize="small" />,
        cctv: <CameraAltIcon fontSize="small" />,
        "first aid kit": <HealthAndSafetyIcon fontSize="small" />,
        "pet friendly": <PetsIcon fontSize="small" />,
        "no smoking": <SmokeFreeIcon fontSize="small" />,
        workspace: <WorkIcon fontSize="small" />,
        "dining area": <RestaurantIcon fontSize="small" />,
        microwave: <MicrowaveIcon fontSize="small" />,
        "coffee maker": <CoffeeIcon fontSize="small" />,
        bathtub: <BathtubIcon fontSize="small" />,
    };

    const getAmenityIcon = (name) => {
        const key = String(name || "").trim().toLowerCase();
        return AMENITY_ICONS[key] || <CheckCircleOutline sx={{ fontSize: 18 }} />;
    };

    return (
        <Box p={{ xs: 2, md: 4 }} maxWidth="1200px" mx="auto">
            {/* Header */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
                mb={4}
            >
                <Box>
                    <Typography variant="h4" fontWeight={900}>
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
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/hosting/listings/${id}/edit`)}
                    sx={{
                        borderRadius: 999,
                        px: 3,
                        py: 1.2,
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: theme.shadows[6]
                    }}
                >
                    Edit Listing
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

                        {listing?.amenities?.length > 0 ? (
                            <Grid container spacing={1.2}>
                                {listing.amenities.slice(0, 6).map((amenity, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Box
                                            sx={{
                                                p: 1.4,
                                                borderRadius: 2.5,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                bgcolor: "var(--bg-card)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.2,
                                                transition: "all 0.18s ease",

                                                "&:hover": {
                                                    transform: "translateY(-1px)",
                                                    boxShadow: 3,
                                                    backgroundColor: "action.hover",
                                                },
                                            }}
                                        >
                                            {/* Icon */}
                                            <Box
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 2,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    bgcolor: "primary.main",
                                                    color: "primary.contrastText",
                                                    opacity: 0.9,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {getAmenityIcon(amenity)}
                                            </Box>

                                            {/* Label */}
                                            <Typography
                                                fontWeight={900}
                                                sx={{ fontSize: "0.95rem" }}
                                            >
                                                {amenity}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body2" color="var(--text-secondary)">
                                No amenities listed.
                            </Typography>
                        )}
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
        </Box>
    );
};

export default HostListingDetails;
