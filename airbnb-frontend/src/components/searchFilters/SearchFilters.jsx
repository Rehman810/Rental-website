import React, { useState } from 'react';
import {
    Box,
    TextField,
    Slider,
    FormGroup,
    FormControlLabel,
    Switch,
    Chip,
    Button,
    Typography,
    InputAdornment,
    Divider,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { CURRENCY } from "../../config/env";

const amenitiesList = ["Wifi", "AC", "Parking", "Pool", "Kitchen", "TV", "Washer", "Iron", "Heating"];

const SearchFilters = ({
    filters,
    onFilterChange,
    onAiSearch,
    searchAsMove,
    setSearchAsMove,
    onClear
}) => {
    const [aiQuery, setAiQuery] = useState("");
    const [open, setOpen] = useState(false);

    const handlePriceChange = (event, newValue) => {
        onFilterChange({ ...filters, priceRange: newValue });
    };

    const handleAmenityToggle = (amenity) => {
        const current = filters.amenities || [];
        const newAmenities = current.includes(amenity)
            ? current.filter(a => a !== amenity)
            : [...current, amenity];
        onFilterChange({ ...filters, amenities: newAmenities });
    };

    const handleAiSubmit = () => {
        if (aiQuery.trim()) {
            onAiSearch(aiQuery);
            setOpen(false); // Close if open
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAiSubmit();
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Active filter count for badge
    const activeCount =
        (filters.priceRange?.[1] < 100000 ? 1 : 0) +
        (filters.amenities?.length || 0) +
        (searchAsMove ? 1 : 0);

    return (
        <>
            {/* Main Search Bar Area */}
            <Paper
                elevation={3}
                sx={{
                    p: 1.5,
                    mb: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: '900px',
                    mx: 'auto',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* AI / Text Search Input */}
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Start your search (e.g., 'Modern apartment in DHA')"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: '1.1rem', px: 1 },
                        startAdornment: (
                            <InputAdornment position="start">
                                <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                            </InputAdornment>
                        )
                    }}
                />

                <Divider orientation="vertical" flexItem sx={{ height: 28, alignSelf: 'center' }} />

                {/* Quick Actions */}
                <Button
                    onClick={handleAiSubmit}
                    variant="contained"
                    sx={{
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        px: 3,
                        boxShadow: 'none'
                    }}
                >
                    Search
                </Button>

                <Button
                    variant="outlined"
                    onClick={handleOpen}
                    startIcon={<FilterListIcon />}
                    sx={{
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        color: 'primary.main',
                        borderColor: 'divider',
                        whiteSpace: 'nowrap',
                        minWidth: 'auto'
                    }}
                >
                    Filters {activeCount > 0 && <Chip label={activeCount} size="small" color="primary" sx={{ height: 20, ml: 1, fontSize: 10 }} />}
                </Button>
            </Paper>

            {/* Filters Modal */}
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h5" fontWeight="bold">Filters</Typography>
                    <IconButton onClick={handleClose}><CloseIcon /></IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ py: 2 }}>

                        {/* Search as Move */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2, backgroundColor: "var(--bg-secondary)" }}>
                            <Box>
                                <Typography fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MyLocationIcon fontSize="small" color="action" sx={{ color: "var(--text-primary)" }} /> Search as I move map
                                </Typography>
                                <Typography variant="caption" color="var(--text-secondary)">Automatically update results when dragging the map</Typography>
                            </Box>
                            <Switch
                                checked={searchAsMove}
                                onChange={(e) => setSearchAsMove(e.target.checked)}
                            />
                        </Box>

                        {/* Price Range */}
                        <Box sx={{ mb: 4 }}>
                            <Typography fontWeight="bold" gutterBottom>Price Range (${CURRENCY})</Typography>
                            <Slider
                                value={filters.priceRange || [0, 100000]}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100000}
                                step={1000}
                                disableSwap
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <TextField
                                    size="small"
                                    value={filters.priceRange?.[0] || 0}
                                    InputProps={{ readOnly: true, startAdornment: <InputAdornment sx={{ color: "var(--text-primary)" }} position="start">{CURRENCY}</InputAdornment> }}
                                    sx={{ width: 120, color: "var(--text-primary)" }}
                                />
                                <Typography color="var(--text-secondary)">-</Typography>
                                <TextField
                                    size="small"
                                    value={filters.priceRange?.[1] || 100000}
                                    InputProps={{ readOnly: true, startAdornment: <InputAdornment sx={{ color: "var(--text-primary)" }} position="start">{CURRENCY}</InputAdornment> }}
                                    sx={{ width: 120, color: "var(--text-primary)" }}
                                />
                            </Box>
                        </Box>

                        {/* Amenities */}
                        <Box>
                            <Typography fontWeight="bold" gutterBottom>Amenities</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {amenitiesList.map(amenity => (
                                    <Chip
                                        key={amenity}
                                        label={amenity}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        clickable
                                        variant={(filters.amenities || []).includes(amenity) ? "filled" : "outlined"}
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 700,

                                            backgroundColor: (filters.amenities || []).includes(amenity)
                                                ? "var(--bg-tertiary)"
                                                : "transparent",

                                            color: "var(--text-primary)",

                                            borderColor: (filters.amenities || []).includes(amenity)
                                                ? "var(--border-focus)"
                                                : "var(--border-light)",

                                            "&:hover": {
                                                backgroundColor: "var(--bg-secondary)",
                                            },

                                            "&.MuiChip-filled": {
                                                backgroundColor: "var(--bg-tertiary)",
                                            },
                                        }}
                                    />

                                ))}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                    <Button onClick={onClear} color="error" sx={{ textTransform: 'none' }}>Clear all</Button>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{ borderRadius: '50px', px: 4, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Show {activeCount > 0 ? 'Results' : 'Listings'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SearchFilters;
