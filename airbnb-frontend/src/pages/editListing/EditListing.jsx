import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { hostListingApi } from '../../services/hostListingService';
import { toast } from 'react-hot-toast'; // Using hot-toast as per app
import {
    Box, Button, TextField, Typography, Checkbox, FormControlLabel,
    Grid, Paper, Stack, InputAdornment, IconButton, MenuItem, Select, FormControl, InputLabel,
    useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
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
import usePageTitle from '../../hooks/usePageTitle';
import BackButton from '../../components/backButton/backButton';
import { ALL_AMENITIES } from '../../components/amenities/amenitiesData';

const EditListing = () => {
    usePageTitle("Edit Listing");
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const isMobile = useMediaQuery("(max-width:1100px)");

    const { control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting, isDirty } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            weekdayPrice: 0,
            weekendPrice: 0,
            bookingMode: 'request',
            amenities: [],
            guestCapacity: 1,
            beds: 1,
            bedrooms: 1,
            bathrooms: 1,
            minNights: 1,
            maxNights: 30,
            photos: [],
            wifiPassword: '',
            checkInInstructions: ''
        }
    });

    // Watch photos for preview?
    const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
        control,
        name: "photos"
    });

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const data = await hostListingApi.getById(id);

                reset({
                    ...data,
                    photos: data.photos ? data.photos.map(p => ({ url: p })) : []
                });
            } catch (error) {
                toast.error("Failed to load listing");
                navigate('/hosting/listings');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id, reset, navigate]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                photos: data.photos.map(p => p.url).filter(url => url)
            };

            await hostListingApi.update(id, payload);
            toast.success("Listing updated successfully");
            navigate(`/hosting/listings/${id}`);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update listing");
        }
    };

    if (loading) return <Typography p={4}>Loading...</Typography>;

    return (
        <Box p={4} maxWidth="800px" margin="0 auto">
            <BackButton />
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" mb={3}>Edit Listing</Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                    {/* Basic Info */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" mb={2}>Basic Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name="title"
                                    control={control}
                                    rules={{ required: "Title is required", minLength: { value: 5, message: "Min 5 chars" } }}
                                    render={({ field }) => (
                                        <TextField {...field} label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="description"
                                    control={control}
                                    rules={{ required: "Description is required", minLength: 20 }}
                                    render={({ field }) => (
                                        <TextField {...field} label="Description" multiline rows={4} fullWidth error={!!errors.description} helperText={errors.description?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="bookingMode"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth>
                                            <InputLabel>Booking Mode</InputLabel>
                                            <Select {...field} label="Booking Mode">
                                                <MenuItem value="request">Request to Book</MenuItem>
                                                <MenuItem value="instant">Instant Book</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Pricing */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" mb={2}>Pricing (PKR)</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Controller
                                    name="weekdayPrice"
                                    control={control}
                                    rules={{ required: true, min: 1 }}
                                    render={({ field }) => (
                                        <TextField {...field} type="number" label="Weekday Price" fullWidth InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    name="weekendPrice"
                                    control={control}
                                    rules={{ required: true, min: 1 }}
                                    render={({ field }) => (
                                        <TextField {...field} type="number" label="Weekend Price" fullWidth InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Capacity */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" mb={2}>Capacity</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Controller name="guestCapacity" control={control} render={({ field }) => <TextField {...field} type="number" label="Guests" fullWidth />} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Controller name="bedrooms" control={control} render={({ field }) => <TextField {...field} type="number" label="Bedrooms" fullWidth />} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Controller name="beds" control={control} render={({ field }) => <TextField {...field} type="number" label="Beds" fullWidth />} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Controller name="bathrooms" control={control} render={({ field }) => <TextField {...field} type="number" label="Baths" fullWidth />} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Controller name="minNights" control={control} render={({ field }) => <TextField {...field} type="number" label="Min Nights" fullWidth />} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Controller name="maxNights" control={control} render={({ field }) => <TextField {...field} type="number" label="Max Nights" fullWidth />} />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Amenities */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Stack spacing={1.5}>
                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    What this place offers
                                </Typography>
                                <Typography variant="body2" color="">
                                    Select amenities available for guests
                                </Typography>
                            </Box>

                            <Controller
                                name="amenities"
                                control={control}
                                render={({ field }) => (
                                    <Grid container spacing={1.2}>
                                        {ALL_AMENITIES.map((amenityObj) => {
                                            const amenity = amenityObj.name;
                                            const selected = field.value
                                                .map(a => a.toLowerCase())
                                                .includes(amenity.toLowerCase());

                                            return (
                                                <Grid item xs={12} sm={6} md={4} key={amenity}>
                                                    <Box
                                                        onClick={() => {
                                                            const updated = selected
                                                                ? field.value.filter((a) => a.toLowerCase() !== amenity.toLowerCase())
                                                                : [...field.value, amenity];
                                                            field.onChange(updated);
                                                        }}
                                                        sx={{
                                                            p: 1.4,
                                                            borderRadius: 2.5,
                                                            border: "1px solid",
                                                            bgcolor: selected ? "var(--accent-primary)" : "var(--bg-card)",
                                                            borderColor: selected ? "var(--accent-primary)" : "var(--border-light)",
                                                            color: selected
                                                                ? "var(--text-primary)"
                                                                : "var(--text-primary)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1.2,
                                                            cursor: "pointer",
                                                            transition: "all 0.18s ease",

                                                            "&:hover": {
                                                                transform: "translateY(-1px)",
                                                                boxShadow: 3,
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
                                                                bgcolor: selected ? "var(--accent-primary)" : "var(--bg-card)",
                                                                color: selected
                                                                    ? "inherit"
                                                                    : "primary.contrastText",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {React.cloneElement(amenityObj.icon, { sx: { fontSize: "18px !important" } })}
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
                                            );
                                        })}
                                    </Grid>
                                )}
                            />
                        </Stack>
                    </Paper>

                    {/* Check-in Details */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" mb={2}>Check-in Details</Typography>
                        <Stack spacing={2}>
                            <Controller
                                name="wifiPassword"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="WiFi Password" fullWidth />
                                )}
                            />
                            <Controller
                                name="checkInInstructions"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Check-in Instructions & Pre-requisites" multiline rows={4} fullWidth />
                                )}
                            />
                            <Typography variant="caption" color="textSecondary">
                                These details will be sent to guests one day before check-in.
                            </Typography>
                        </Stack>
                    </Paper>

                    {/* Photos */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" mb={2}>Photos (URLs)</Typography>
                        <Stack spacing={2}>
                            {photoFields.map((field, index) => (
                                <Stack direction="row" spacing={2} key={field.id} alignItems="center">
                                    <Controller
                                        name={`photos.${index}.url`}
                                        control={control}
                                        rules={{ required: "URL required" }}
                                        render={({ field: inputField }) => (
                                            <TextField {...inputField} fullWidth label={`Photo ${index + 1}`} size="small" />
                                        )}
                                    />
                                    <IconButton onClick={() => removePhoto(index)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={() => appendPhoto({ url: '' })} variant="outlined">
                                Add Photo
                            </Button>
                        </Stack>
                    </Paper>
                    <Box
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            mt: 3,
                            pb: 2,
                            pt: 2,
                            background: `
  linear-gradient(
    180deg,
    transparent 0%,
    var(--bg-secondary) 40%,
    var(--bg-primary) 100%
  )
`,
                            backdropFilter: 'blur(6px)',
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                                borderRadius: 4,

                                border: "1px solid var(--border-light)",
                                backgroundColor: "var(--bg-card)",
                                boxShadow: "var(--shadow-md)",

                                px: { xs: 2, md: 3 },
                                py: 1.5,
                            }}
                        >
                            <Box>
                                <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                    Ready to apply changes?
                                </Typography>
                                {!isMobile && (
                                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                        Save once and you’re good to go.
                                    </Typography>
                                )}
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                sx={{
                                    px: 4,
                                    py: 1.4,
                                    borderRadius: 3,
                                    fontWeight: 900,
                                    textTransform: 'none',
                                    fontSize: 15,
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                                }}
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </Box></Box>
                </Stack>
            </form>
        </Box>
    );
};

export default EditListing;
