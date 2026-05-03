import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { CURRENCY } from "../../config/env";
import { ALL_AMENITIES } from "../amenities/amenitiesData";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const SUGGESTION_CHIPS = [
  { label: "DHA Lahore", query: "luxury apartment in DHA Lahore" },
  { label: "Beach Villa Karachi", query: "beach villa in Karachi" },
  { label: "Budget Apartments", query: "budget apartments under 20k" },
  { label: "Murree Cottage", query: "cottage in Murree" },
  { label: "Hunza Retreat", query: "retreat in Hunza" },
];

const PremiumSearchBar = ({
  filters,
  onFilterChange,
  onAiSearch,
  searchAsMove,
  onClear,
  isHero = false,
}) => {
  const { t } = useTranslation();
  const [aiQuery, setAiQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handleAiSubmit = () => {
    if (aiQuery.trim()) {
      onAiSearch(aiQuery);
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAiSubmit();
    if (e.key === "Escape") setIsFocused(false);
  };

  const handleChipClick = (chip) => {
    setAiQuery(chip.query);
    onAiSearch(chip.query);
    setIsFocused(false);
  };

  const activeCount =
    (filters.priceRange?.[1] < 100000 ? 1 : 0) +
    (filters.amenities?.length || 0);

  const suggestions = t("homepage:suggestions", { returnObjects: true }) || SUGGESTION_CHIPS;

  return (
    <>
      <MotionBox
        initial={isHero ? { opacity: 0, y: 20 } : false}
        animate={isHero ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        sx={{ width: "100%", maxWidth: 820, mx: "auto" }}
      >
        {/* Main Bar */}
        <Paper
          elevation={0}
          onClick={() => inputRef.current?.focus()}
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: "999px",
            border: isFocused
              ? "2px solid rgba(255,255,255,0.6)"
              : "1.5px solid rgba(255,255,255,0.15)",
            background: "rgba(15, 15, 15, 0.82)",
            backdropFilter: "blur(24px)",
            px: { xs: 1.5, md: 2.5 },
            py: { xs: 0.5, md: 0.75 },
            gap: { xs: 1, md: 1.5 },
            boxShadow: isFocused
              ? "0 0 0 4px rgba(255,255,255,0.08), 0 24px 60px rgba(0,0,0,0.5)"
              : "0 20px 60px rgba(0,0,0,0.4)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            cursor: "text",
          }}
        >
          {/* AI Icon */}
          <AutoAwesomeIcon
            sx={{
              color: "#FF385C",
              fontSize: { xs: 20, md: 24 },
              flexShrink: 0,
              filter: "drop-shadow(0 0 6px rgba(255,56,92,0.5))",
            }}
          />

          {/* Input */}
          <InputBase
            inputRef={inputRef}
            fullWidth
            placeholder={t("homepage:searchPlaceholder") || '3 bedroom villa in DHA under 50k...'}
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            sx={{
              color: "#fff",
              fontSize: { xs: "0.875rem", md: "1.05rem" },
              fontWeight: 500,
              "& input::placeholder": {
                color: "rgba(255,255,255,0.45)",
                opacity: 1,
              },
            }}
          />

          {/* Clear */}
          {aiQuery && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setAiQuery("");
                onClear();
              }}
              sx={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              borderColor: "rgba(255,255,255,0.12)",
              height: 28,
              alignSelf: "center",
              display: { xs: "none", sm: "block" },
            }}
          />

          {/* Filter Button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            sx={{
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              width: { xs: 34, md: 40 },
              height: { xs: 34, md: 40 },
              flexShrink: 0,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.08)",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            {activeCount > 0 ? (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#FF385C",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  color: "#fff",
                }}
              >
                {activeCount}
              </Box>
            ) : (
              <FilterListIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>

          {/* Search Button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleAiSubmit();
            }}
            sx={{
              bgcolor: "#FF385C",
              color: "#fff",
              borderRadius: "999px",
              width: { xs: 36, md: 44 },
              height: { xs: 36, md: 44 },
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(255,56,92,0.45)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#E0284F",
                transform: "scale(1.07)",
                boxShadow: "0 6px 24px rgba(255,56,92,0.6)",
              },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            <SearchIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
          </IconButton>
        </Paper>

        {/* Suggestion Chips */}
        <AnimatePresence>
          {(isHero || isFocused) && (
            <MotionBox
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 2,
                justifyContent: "center",
                px: { xs: 1, md: 0 },
              }}
            >
              {(Array.isArray(suggestions) ? suggestions : SUGGESTION_CHIPS).map((chip) => (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  onClick={() => handleChipClick(chip)}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.18)",
                      borderColor: "rgba(255,255,255,0.35)",
                      transform: "translateY(-1px)",
                    },
                    "& .MuiChip-label": { px: 1.5 },
                  }}
                />
              ))}
            </MotionBox>
          )}
        </AnimatePresence>
      </MotionBox>

      {/* Advanced Filters Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <Typography variant="h6" fontWeight={900} sx={{ color: "var(--text-primary)" }}>
            {t("common:filters") || "Filters"}
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: "var(--text-secondary)" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {/* Price Range */}
          <Box sx={{ mb: 4 }}>
            <Typography fontWeight={800} gutterBottom sx={{ color: "var(--text-primary)", mb: 2 }}>
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
                "& .MuiSlider-thumb": {
                  boxShadow: "0 0 0 3px rgba(255,56,92,0.15)",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <TextField
                size="small"
                value={draftFilters.priceRange?.[0] ?? 0}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{CURRENCY}</span>
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 120 }}
              />
              <TextField
                size="small"
                value={draftFilters.priceRange?.[1] ?? 100000}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{CURRENCY}</span>
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 120 }}
              />
            </Box>
          </Box>

          {/* Amenities */}
          <Box>
            <Typography fontWeight={800} gutterBottom sx={{ color: "var(--text-primary)", mb: 2 }}>
              {t("common:amenities") || "Amenities"}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {ALL_AMENITIES.map((amenityObj) => {
                const amenity = amenityObj.name;
                const isSelected = (draftFilters.amenities || []).includes(amenity);
                return (
                  <Chip
                    key={amenity}
                    label={amenity}
                    icon={React.cloneElement(amenityObj.icon, {
                      sx: { fontSize: "16px !important", ml: "6px !important" },
                    })}
                    onClick={() => {
                      const current = draftFilters.amenities || [];
                      setDraftFilters({
                        ...draftFilters,
                        amenities: isSelected
                          ? current.filter((a) => a !== amenity)
                          : [...current, amenity],
                      });
                    }}
                    clickable
                    variant={isSelected ? "filled" : "outlined"}
                    sx={{
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      backgroundColor: isSelected ? "rgba(255,56,92,0.1)" : "transparent",
                      color: isSelected ? "#FF385C" : "var(--text-primary)",
                      borderColor: isSelected ? "#FF385C" : "var(--border-light)",
                      "&:hover": { borderColor: "#FF385C", bgcolor: "rgba(255,56,92,0.06)" },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            justifyContent: "space-between",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <Button
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            sx={{
              color: "var(--text-primary)",
              textTransform: "none",
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            {t("common:clearAll") || "Clear all"}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onFilterChange(draftFilters);
              setOpen(false);
            }}
            sx={{
              bgcolor: "#222",
              color: "#fff",
              borderRadius: "999px",
              px: 4,
              py: 1.2,
              textTransform: "none",
              fontWeight: 800,
              fontSize: "0.95rem",
              "&:hover": { bgcolor: "#FF385C" },
              transition: "all 0.2s ease",
            }}
          >
            {activeCount > 0
              ? t("common:showResults") || "Show results"
              : t("common:showListings") || "Show listings"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PremiumSearchBar;
