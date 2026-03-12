import React, { useMemo } from "react";
import { Grid, Typography, Box, Stack, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ALL_AMENITIES } from "./amenitiesData";

const Amenities = ({ backendAmenities = [], variant = "grid", limit }) => {
  // ✅ Normalize backend list (case-insensitive safe)
  const normalizedBackend = useMemo(() => {
    return (backendAmenities || []).map((a) => String(a).trim().toLowerCase());
  }, [backendAmenities]);

  // ✅ Match known amenities
  const filteredAmenities = useMemo(() => {
    return ALL_AMENITIES.filter((amenity) =>
      normalizedBackend.includes(amenity.name.toLowerCase())
    );
  }, [normalizedBackend]);

  // ✅ Show unknown backend amenities too (fallback icon)
  const unknownAmenities = useMemo(() => {
    const knownNames = ALL_AMENITIES.map((a) => a.name.toLowerCase());

    return (backendAmenities || [])
      .filter((a) => !knownNames.includes(String(a).trim().toLowerCase()))
      .map((a) => ({
        name: a,
        icon: <CheckCircleIcon fontSize="large" />,
      }));
  }, [backendAmenities]);

  const allFinalAmenities = [...filteredAmenities, ...unknownAmenities];
  
  const finalAmenities = limit ? allFinalAmenities.slice(0, limit) : allFinalAmenities;
  const remainingCount = allFinalAmenities.length - finalAmenities.length;

  if (!allFinalAmenities.length) {
    return (
      <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 2 }}>
        No amenities listed.
      </Typography>
    );
  }

  if (variant === "chip") {
    return (
      <Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ mt: 1.6 }}>
        {finalAmenities.map((amenity, index) => (
          <Chip
            key={index}
            label={amenity.name}
            icon={React.cloneElement(amenity.icon, { sx: { fontSize: "16px !important", ml: "6px !important" } })}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 999, fontWeight: 800, mb: 0.6, color: "var(--text-secondary)" }}
          />
        ))}
        {remainingCount > 0 && (
          <Chip
            label={`+${remainingCount} more`}
            size="small"
            sx={{ borderRadius: 999, fontWeight: 900, color: "var(--text-secondary)" }}
          />
        )}
      </Stack>
    );
  }

  if (variant === "card") {
    return (
      <Grid container spacing={1.2}>
        {finalAmenities.map((amenity, index) => (
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
                {React.cloneElement(amenity.icon, { sx: { fontSize: "18px !important" } })}
              </Box>

              {/* Label */}
              <Typography fontWeight={900} sx={{ fontSize: "0.95rem" }}>
                {amenity.name}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {finalAmenities.map((amenity, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            <Box sx={{ color: "primary.main" }}>{amenity.icon}</Box>
            <Typography sx={{ fontWeight: 800 }}>{amenity.name}</Typography>
          </Box>
        </Grid>
      ))}
      {remainingCount > 0 && (
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: "var(--text-secondary)", mt: 1 }}>
            +{remainingCount} more amenities
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default Amenities;
