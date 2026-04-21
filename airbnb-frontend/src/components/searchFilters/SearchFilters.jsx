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
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { CURRENCY } from "../../config/env";
import { ALL_AMENITIES } from "../amenities/amenitiesData";
import Stack from "@mui/material/Stack"
import { useTranslation } from 'react-i18next';

const SearchFilters = ({
    filters,
    onFilterChange,
    onAiSearch,
    searchAsMove,
    onClear
}) => {
    const { t } = useTranslation();
    const [aiQuery, setAiQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState(filters);
    
    const handlePriceChange = (event, newValue) => {
        setDraftFilters({ ...draftFilters, priceRange: newValue });
    };

    const handleAmenityToggle = (amenity) => {
        const current = draftFilters.amenities || [];
        const newAmenities = current.includes(amenity)
            ? current.filter(a => a !== amenity)
            : [...current, amenity];

        setDraftFilters({ ...draftFilters, amenities: newAmenities });
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
                elevation={6}
                sx={{
                    p: { xs: 1, md: 1.5 },
                    mb: 4,
                    borderRadius: "20px", // Pill shape back for both
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'row', // Keep row even on mobile for that "search bar" feel
                    alignItems: 'center',
                    gap: { xs: 0.5, md: 2 },
                    maxWidth: '850px',
                    mx: { xs: 1, md: 'auto' },
                    background: 'rgba(20, 20, 20, 0.85)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* AI / Text Search Input */}
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder={t("homepage:searchPlaceholder")}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        disableUnderline: true,
                        sx: (theme) => ({
                            fontSize: { xs: "0.85rem", md: "1.1rem" },
                            px: { xs: 1, md: 2 },
                            color: "#fff",
                            "& input::placeholder": {
                                color: "rgba(255, 255, 255, 0.5)",
                                opacity: 1,
                            },
                        }),

                        startAdornment: (
                            <InputAdornment position="start">
                                <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: { xs: 20, md: 28 }, ml: 1 }} />
                            </InputAdornment>
                        ),
                        endAdornment: aiQuery && (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => {
                                        setAiQuery("");
                                        onClear();
                                    }}
                                    edge="end"
                                    size="small"
                                    sx={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}

                />

                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        height: 28,
                        alignSelf: 'center',
                        borderColor: 'rgba(255,255,255,0.1)',
                        display: { xs: 'none', sm: 'block' }
                    }}
                />

                {/* Quick Actions */}
                <Stack direction="row" spacing={1} sx={{ pr: 0.5 }}>
                    <IconButton
                        onClick={handleAiSubmit}
                        sx={{
                            bgcolor: "primary.main",
                            color: "#fff",
                            width: { xs: 36, md: 45 },
                            height: { xs: 36, md: 45 },
                            "&:hover": { bgcolor: "primary.dark" }
                        }}
                    >
                        <SearchIcon sx={{ fontSize: { xs: "1.1rem", md: "1.4rem", color: "#fff" } }} />
                    </IconButton>

                    <IconButton
                        onClick={handleOpen}
                        sx={{
                            color: "#fff",
                            border: '1px solid rgba(255,255,255,0.2)',
                            width: { xs: 36, md: 45 },
                            height: { xs: 36, md: 45 },
                        }}
                    >
                        {activeCount > 0 ? (
                            <Chip
                                label={activeCount}
                                size="small"
                                color="primary"
                                sx={{ height: 18, fontSize: 10, px: 0 }}
                            />
                        ) : (
                            <FilterListIcon sx={{ fontSize: { xs: "1.1rem", md: "1.4rem" } }} />
                        )}
                    </IconButton>
                </Stack>
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
                    <Typography variant="h5" fontWeight="bold">{t("common:filters")}</Typography>
                    <IconButton onClick={handleClose}><CloseIcon /></IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ py: 2 }}>

                        {/* Price Range */}
                        <Box sx={{ mb: 4, width: "95%" }}>
                            <Typography fontWeight="bold" gutterBottom>{t("common:priceRange")} (${CURRENCY})</Typography>
                            <Slider
                                value={draftFilters.priceRange || [0, 100000]}
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
                                    value={draftFilters.priceRange?.[0] || 0}
                                    InputProps={{ readOnly: true, startAdornment: <InputAdornment sx={{ color: "var(--text-primary)" }} position="start"><span style={{ color: "var(--text-primary)" }}>{CURRENCY}</span></InputAdornment> }}
                                    sx={{ width: 120, color: "var(--text-primary)" }}
                                />
                                <Typography color="var(--text-secondary)">-</Typography>
                                <TextField
                                    size="small"
                                    value={draftFilters.priceRange?.[1] || 100000}
                                    InputProps={{ readOnly: true, startAdornment: <InputAdornment sx={{ color: "var(--text-primary)" }} position="start"><span style={{ color: "var(--text-primary)" }}></span>{CURRENCY}</InputAdornment> }}
                                    sx={{ width: 120, color: "var(--text-primary)" }}
                                />
                            </Box>
                        </Box>

                        {/* Amenities */}
                        <Box>
                            <Typography fontWeight="bold" gutterBottom>{t("common:amenities")}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {ALL_AMENITIES.map(amenityObj => {
                                    const amenity = amenityObj.name;
                                    const isSelected = (draftFilters.amenities || []).includes(amenity); return (
                                        <Chip
                                            key={amenity}
                                            label={amenity}
                                            icon={React.cloneElement(amenityObj.icon, { sx: { fontSize: "16px !important", ml: "6px !important" } })}
                                            onClick={() => handleAmenityToggle(amenity)}
                                            clickable
                                            variant={isSelected ? "filled" : "outlined"}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 700,

                                                backgroundColor: isSelected
                                                    ? "var(--bg-tertiary)"
                                                    : "transparent",

                                                color: "var(--text-primary)",

                                                borderColor: isSelected
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
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                    <Button onClick={onClear} color="error" variant="outlined" sx={{ textTransform: 'none' }}>{t("common:clearAll")}</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            onFilterChange(draftFilters);
                            handleClose();
                        }}
                        sx={{ borderRadius: '50px', px: 4, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        {activeCount > 0 ? t("common:showResults") : t("common:showListings")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SearchFilters;
