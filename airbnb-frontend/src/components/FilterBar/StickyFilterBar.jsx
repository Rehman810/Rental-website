import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  Chip,
  IconButton,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  TextField,
  InputAdornment,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import PlaceIcon from "@mui/icons-material/Place";
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CURRENCY } from "../../config/env";
import { ALL_AMENITIES } from "../amenities/amenitiesData";

const MotionPaper = motion(Paper);

const StickyFilterBar = ({ filters, onFilterChange, onClear, scrollThreshold = 420 }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);   // desktop full dialog
  const [drawerOpen, setDrawerOpen] = useState(false);   // mobile bottom sheet
  const [draftFilters, setDraftFilters] = useState(filters);

  // Keep draft in sync when filters reset externally
  useEffect(() => { setDraftFilters(filters); }, [filters]);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > scrollThreshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  const activeCount =
    (filters.priceRange?.[1] < 100000 ? 1 : 0) +
    (filters.amenities?.length || 0);

  const hasActiveFilters = !!(filters.q || activeCount > 0 || filters.checkIn || filters.checkOut);

  const handleApply = () => {
    onFilterChange(draftFilters);
    setDialogOpen(false);
    setDrawerOpen(false);
  };

  const handleClear = () => {
    onClear();
    setDialogOpen(false);
    setDrawerOpen(false);
  };

  const toggleAmenity = (amenity) => {
    const current = draftFilters.amenities || [];
    setDraftFilters({
      ...draftFilters,
      amenities: current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity],
    });
  };

  /* ── Shared filter content ─────────────────────────── */
  const FilterContent = () => (
    <Box>
      {/* Price Range */}
      <Box sx={{ mb: 4 }}>
        <Typography fontWeight={800} sx={{ color: "var(--text-primary)", mb: 2 }}>
          {t("common:priceRange") || "Price Range"} ({CURRENCY})
        </Typography>
        <Slider
          value={draftFilters.priceRange || [0, 100000]}
          onChange={(_, v) => setDraftFilters({ ...draftFilters, priceRange: v })}
          valueLabelDisplay="auto"
          min={0}
          max={100000}
          step={1000}
          disableSwap
          sx={{
            color: "#FF385C",
            "& .MuiSlider-thumb": { boxShadow: "0 0 0 3px rgba(255,56,92,0.15)" },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <TextField
            size="small"
            value={`${CURRENCY} ${(draftFilters.priceRange?.[0] ?? 0).toLocaleString()}`}
            InputProps={{ readOnly: true }}
            sx={{ width: 130 }}
          />
          <TextField
            size="small"
            value={`${CURRENCY} ${(draftFilters.priceRange?.[1] ?? 100000).toLocaleString()}`}
            InputProps={{ readOnly: true }}
            sx={{ width: 130 }}
          />
        </Box>
      </Box>

      {/* Amenities */}
      <Box>
        <Typography fontWeight={800} sx={{ color: "var(--text-primary)", mb: 2 }}>
          {t("common:amenities") || "Amenities"}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {ALL_AMENITIES.map((amenityObj) => {
            const amenity = amenityObj.name;
            const isSelected = (draftFilters.amenities || []).includes(amenity);
            return (
              <Chip
                key={amenity}
                label={t(`common:amenitiesList.${amenity}`, amenity)}
                icon={React.cloneElement(amenityObj.icon, {
                  sx: { fontSize: "16px !important", ml: "6px !important" },
                })}
                onClick={() => toggleAmenity(amenity)}
                clickable
                sx={{
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  bgcolor: isSelected ? "rgba(255,56,92,0.1)" : "transparent",
                  color: isSelected ? "#FF385C" : "var(--text-primary)",
                  border: `1px solid ${isSelected ? "#FF385C" : "var(--border-light)"}`,
                  "&:hover": { borderColor: "#FF385C", bgcolor: "rgba(255,56,92,0.06)" },
                }}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AnimatePresence>
        {visible && (
          <MotionPaper
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            elevation={0}
            sx={{
              position: "fixed",
              // sit BELOW the navbar (navbar is ~64px on desktop, 56px on mobile)
              top: { xs: "56px", md: "64px" },
              left: 0,
              right: 0,
              zIndex: 1100,          // below navbar (1200-1300) but above content
              bgcolor: "var(--bg-primary)",
              borderBottom: "1px solid var(--border-light)",
              backdropFilter: "blur(20px)",
              px: { xs: 2, md: 4 },
              py: { xs: 0.75, md: 1 },
            }}
          >
            {/* ── DESKTOP layout ───────────────────────── */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                maxWidth: 900,
                mx: "auto",
              }}
            >
              {/* Quick search pill */}
              {filters.q && (
                <Chip
                  label={`"${filters.q}"`}
                  onDelete={onClear}
                  sx={{
                    fontWeight: 700,
                    bgcolor: "rgba(255,56,92,0.1)",
                    color: "#FF385C",
                    border: "1px solid #FF385C",
                    "& .MuiChip-deleteIcon": { color: "#FF385C" },
                  }}
                />
              )}

              {/* Filters button */}
              <Button
                startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
                onClick={() => { setDraftFilters(filters); setDialogOpen(true); }}
                variant={activeCount > 0 ? "contained" : "outlined"}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  px: 2,
                  py: 0.8,
                  ...(activeCount > 0
                    ? { bgcolor: "#222", color: "#fff", "&:hover": { bgcolor: "#FF385C" } }
                    : {
                        color: "var(--text-primary)",
                        borderColor: "var(--border-light)",
                        "&:hover": { borderColor: "var(--border-focus)", bgcolor: "var(--bg-secondary)" },
                      }),
                }}
              >
                {t("common:filters") || "Filters"}
                {activeCount > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1, bgcolor: "#FF385C", color: "#fff",
                      borderRadius: "50%", width: 20, height: 20,
                      display: "inline-flex", alignItems: "center",
                      justifyContent: "center", fontSize: 11, fontWeight: 900,
                    }}
                  >
                    {activeCount}
                  </Box>
                )}
              </Button>

              {/* Price quick pill */}
              <Button
                startIcon={<AttachMoneyIcon sx={{ fontSize: 16 }} />}
                onClick={() => { setDraftFilters(filters); setDialogOpen(true); }}
                variant="outlined"
                sx={{
                  borderRadius: "999px", textTransform: "none", fontWeight: 700,
                  fontSize: "0.85rem", color: "var(--text-primary)",
                  borderColor: filters.priceRange?.[1] < 100000 ? "#FF385C" : "var(--border-light)",
                  bgcolor: filters.priceRange?.[1] < 100000 ? "rgba(255,56,92,0.06)" : "transparent",
                  px: 2, py: 0.8,
                  "&:hover": { borderColor: "#FF385C", bgcolor: "rgba(255,56,92,0.06)" },
                }}
              >
                {filters.priceRange?.[1] < 100000
                  ? `${t("common:upTo")} ${CURRENCY} ${filters.priceRange[1].toLocaleString()}`
                  : t("common:price")}
              </Button>

              {/* Amenities quick pill */}
              <Button
                startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
                onClick={() => { setDraftFilters(filters); setDialogOpen(true); }}
                variant="outlined"
                sx={{
                  borderRadius: "999px", textTransform: "none", fontWeight: 700,
                  fontSize: "0.85rem", color: "var(--text-primary)",
                  borderColor: filters.amenities?.length > 0 ? "#FF385C" : "var(--border-light)",
                  bgcolor: filters.amenities?.length > 0 ? "rgba(255,56,92,0.06)" : "transparent",
                  px: 2, py: 0.8,
                  "&:hover": { borderColor: "#FF385C", bgcolor: "rgba(255,56,92,0.06)" },
                }}
              >
                {filters.amenities?.length > 0
                  ? `${filters.amenities.length} ${filters.amenities.length === 1 ? t("common:amenity") : t("common:amenities")}`
                  : t("common:amenities")}
              </Button>

              {hasActiveFilters && (
                <Button
                  onClick={handleClear}
                  size="small"
                  sx={{
                    ml: "auto", textTransform: "none", color: "var(--text-secondary)",
                    fontWeight: 600, fontSize: "0.8rem", textDecoration: "underline",
                    "&:hover": { color: "var(--text-primary)" },
                  }}
                >
                  {t("common:clearAll") || "Clear all"}
                </Button>
              )}
            </Box>

            {/* ── MOBILE layout ────────────────────────── */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                gap: 1,
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Chip
                icon={<TuneIcon sx={{ fontSize: 14 }} />}
                label={activeCount > 0 ? `${t("common:filters")} (${activeCount})` : t("common:filters")}
                onClick={() => { setDraftFilters(filters); setDrawerOpen(true); }}
                sx={{
                  fontWeight: 700,
                  bgcolor: activeCount > 0 ? "#222" : "var(--bg-secondary)",
                  color: activeCount > 0 ? "#fff" : "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                  flexShrink: 0,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
              {hasActiveFilters && (
                <Chip
                  label={t("common:clearAll")}
                  onClick={handleClear}
                  sx={{
                    fontWeight: 700, flexShrink: 0,
                    bgcolor: "transparent", color: "#FF385C",
                    border: "1px solid #FF385C",
                  }}
                />
              )}
            </Box>
          </MotionPaper>
        )}
      </AnimatePresence>

      {/* ── DESKTOP Filter Dialog ──────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            bgcolor: "var(--bg-primary)",
            border: "1px solid var(--border-light)",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", pb: 1.5 }}>
          <Typography variant="h6" fontWeight={900} sx={{ color: "var(--text-primary)" }}>
            {t("common:filters") || "Filters"}
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} sx={{ color: "var(--text-secondary)" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <FilterContent />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: "space-between", borderTop: "1px solid var(--border-light)" }}>
          <Button
            onClick={handleClear}
            sx={{ textTransform: "none", fontWeight: 700, textDecoration: "underline", color: "var(--text-primary)" }}
          >
            {t("common:clearAll") || "Clear all"}
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            sx={{
              bgcolor: "#222", color: "#fff", borderRadius: "999px",
              px: 4, py: 1.2, textTransform: "none", fontWeight: 800,
              "&:hover": { bgcolor: "#FF385C" },
            }}
          >
            {activeCount > 0 ? t("common:showResults") || "Show results" : t("common:showListings") || "Show listings"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MOBILE Bottom Sheet ────────────────────────── */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { borderRadius: "24px 24px 0 0", bgcolor: "var(--bg-primary)", maxHeight: "80vh" },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ color: "var(--text-primary)" }}>
              {t("common:filters") || "Filters"}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <FilterContent />
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              fullWidth onClick={handleClear} variant="outlined"
              sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 700 }}
            >
              {t("common:clearAll") || "Clear all"}
            </Button>
            <Button
              fullWidth onClick={handleApply} variant="contained"
              sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 700, bgcolor: "#222", "&:hover": { bgcolor: "#FF385C" } }}
            >
              {t("common:showResults") || "Show results"}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default StickyFilterBar;
