import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  Skeleton,
  Typography,
  Container,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";

import MapIcon from "@mui/icons-material/Map";
import ViewListIcon from "@mui/icons-material/ViewList";
import CloseIcon from "@mui/icons-material/Close";

import { useTranslation } from "react-i18next";
import { fetchData, postData } from "../../config/ServiceApi/serviceApi";
import Card from "../../components/cards/cards";
import LeafletMap from "../../components/map/map";
import SearchFilters from "../../components/searchFilters/SearchFilters";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/context";

const MemoizedCard = React.memo(({ data }) => <Card data={data} />);

const DEFAULT_FILTERS = {
  q: "",
  minPrice: 0,
  maxPrice: 100000,
  guests: 1,
  amenities: [],
  bounds: null,
  polygon: null,
  priceRange: [0, 100000],
};

const Home = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const { searchParams } = useAppContext(); // Get searchParams from context

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map Overlay Toggle (same as previous)
  const [mapVisible, setMapVisible] = useState(false);

  // Filters
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem("searchFilters");
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  const [searchAsMove, setSearchAsMove] = useState(false);

  // Sync Global Search Bar with Local Filters
  useEffect(() => {
    // 🔥 CLEAR SEARCH CASE
    if (!searchParams || Object.keys(searchParams).length === 0) {
      setFilters(DEFAULT_FILTERS);
      return;
    }

    // 🔍 APPLY SEARCH PARAMS
    setFilters((prev) => ({
      ...prev,
      q: searchParams.destination ?? "",
      guests: searchParams.guests ?? DEFAULT_FILTERS.guests,
      checkIn: searchParams.checkIn ?? null,
      checkOut: searchParams.checkOut ?? null,
      bounds: null,
      polygon: null,
    }));
  }, [searchParams]);


  // Persist filters
  useEffect(() => {
    sessionStorage.setItem("searchFilters", JSON.stringify(filters));
  }, [filters]);

  // Build query
  const buildQuery = useCallback((currentFilters) => {
    const query = new URLSearchParams();

    if (currentFilters.q) query.append("q", currentFilters.q);
    if (
      typeof currentFilters.guests === "number" &&
      !isNaN(currentFilters.guests)
    ) {
      query.append("guests", currentFilters.guests);
    }
    if (currentFilters.checkIn) query.append("checkIn", currentFilters.checkIn);
    if (currentFilters.checkOut) query.append("checkOut", currentFilters.checkOut);

    if (currentFilters.priceRange) {
      query.append("minPrice", currentFilters.priceRange[0]);
      query.append("maxPrice", currentFilters.priceRange[1]);
    }

    if (currentFilters.amenities && currentFilters.amenities.length) {
      query.append("amenities", currentFilters.amenities.join(","));
    }

    if (currentFilters.bounds) {
      query.append("bounds", JSON.stringify(currentFilters.bounds));
    }

    if (currentFilters.polygon) {
      query.append("polygon", JSON.stringify(currentFilters.polygon));
    }

    query.append("sortBy", "recommended");

    return query.toString();
  }, []);

  // Search Function
  const performSearch = useCallback(
    async (currentFilters = filters) => {
      setLoading(true);
      try {
        const queryString = buildQuery(currentFilters);

        const data = await fetchData(
          `api/listings/search?${queryString}`,
          token || ""
        );

        setListings(data?.results || []);
      } catch (error) {
        console.error("Search error", error);
        toast.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [filters, token, buildQuery]
  );

  // Debounce filters search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(filters);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    filters.q,
    filters.priceRange,
    filters.amenities,
    filters.bounds,
    filters.polygon,
    performSearch,
    filters,
  ]);

  // AI Search Handler
  const handleAiSearch = async (query) => {
    toast.loading("AI is finding the best spots...", { id: "ai-search" });

    try {
      const res = await postData("api/search/ai", { query }, token || "");

      if (res?.success && res?.parsedFilters) {
        const newFilters = { ...filters, ...res.parsedFilters };

        if (res.parsedFilters.maxPrice) {
          newFilters.priceRange = [0, res.parsedFilters.maxPrice];
        }

        // reset map filters for AI
        newFilters.bounds = null;
        newFilters.polygon = null;

        setFilters(newFilters);

        toast.success("Filters applied by AI!", { id: "ai-search" });

        // if results provided directly
        if (res.results) setListings(res.results);
      } else {
        toast.error("AI could not understand.", { id: "ai-search" });
      }
    } catch (e) {
      toast.error("AI could not understand.", { id: "ai-search" });
    }
  };

  // Map Handlers
  const handleBoundsChange = (bounds) => {
    if (!searchAsMove) return;
    setFilters((prev) => ({ ...prev, bounds, polygon: null }));
  };

  const handleDrawCreated = (coords) => {
    setFilters((prev) => ({ ...prev, polygon: coords, bounds: null }));
    toast.success("Searching within drawn area");
  };

  // Toggle map overlay
  const toggleMapVisibility = () => {
    setMapVisible((prev) => !prev);
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 6, bgcolor: "#fff" }}>
      {/* ===================== MAP OVERLAY VIEW ===================== */}
      {mapVisible ? (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            backgroundColor: "background.paper",
          }}
        >
          {/* Top Bar */}
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              px: 2,
              py: 1,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255,255,255,0.9)",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography fontWeight={900}>
                {t("home.showMap") || "Map"}
              </Typography>

              <IconButton size="small" onClick={toggleMapVisibility}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>

          <LeafletMap
            listings={listings}
            latitude={listings?.[0]?.latitude || 24.8607}
            longitude={listings?.[0]?.longitude || 67.0011}
            searchAsMove={searchAsMove}
            onBoundsChange={handleBoundsChange}
            onDrawCreated={handleDrawCreated}
            enableDraw={true}
          />
        </Box>
      ) : (
        // ===================== LIST VIEW =====================
        <>
          {/* HERO SECTION */}
          <Box
            sx={{
              position: "relative",
              height: listings.length > 0 ? "300px" : "500px",
              transition: "height 0.5s ease",
              backgroundImage:
                "url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant={listings.length > 0 ? "h4" : "h2"}
                color="white"
                fontWeight={900}
                sx={{ mb: 3, textAlign: "center", px: 2 }}
              >
                {listings.length > 0
                  ? "Find your perfect stay"
                  : "Experience Pakistan like never before"}
              </Typography>

              <Box sx={{ width: "100%", maxWidth: "800px", px: 2 }}>
                <SearchFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  onAiSearch={handleAiSearch}
                  searchAsMove={searchAsMove}
                  setSearchAsMove={setSearchAsMove}
                  onClear={() => setFilters(DEFAULT_FILTERS)}
                />
              </Box>
            </Box>
          </Box>

          <Container maxWidth="xl">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
              sx={{ color: "primary.main" }}
            >
              <Typography variant="h6" fontWeight={900}>
                {listings.length > 0
                  ? `${listings.length} Stays found`
                  : "Recommended for you"}
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        height={220}
                        sx={{ borderRadius: 0 }}
                      />
                      <Box sx={{ p: 2 }}>
                        <Skeleton variant="text" width="70%" height={28} />
                        <Skeleton variant="text" width="90%" height={18} />
                        <Skeleton variant="text" width="55%" height={18} />
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : listings.length === 0 ? (
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 4,
                      border: "1px dashed #ccc",
                    }}
                  >
                    <Typography variant="h6" fontWeight={900}>
                      No listings found
                    </Typography>
                    <Typography variant="body2" color="var(--text-secondary)">
                      Try adjusting your filters or area.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                listings.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                    <MemoizedCard data={item} />
                  </Grid>
                ))
              )}
            </Grid>
          </Container>
        </>
      )}

      {/* ===================== FLOATING MAP TOGGLE BUTTON ===================== */}
      <Button
        variant="contained"
        onClick={toggleMapVisibility}
        startIcon={mapVisible ? <ViewListIcon /> : <MapIcon />}
        sx={{
          position: "fixed",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          borderRadius: 999,
          px: 3,
          py: 1.4,
          fontWeight: 900,
          textTransform: "none",
          boxShadow: "0 14px 35px rgba(0,0,0,0.20)",
        }}
      >
        {mapVisible ? "Show List" : "Map"}
      </Button>
    </Box>
  );
};

export default Home;
