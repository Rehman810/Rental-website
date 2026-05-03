import React, { useEffect, useState, useCallback } from "react";
import { getAuthUser } from "../../utils/cookieUtils";
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
  useMediaQuery,
} from "@mui/material";

import MapIcon from "@mui/icons-material/Map";
import ViewListIcon from "@mui/icons-material/ViewList";
import CloseIcon from "@mui/icons-material/Close";

import Pagination from "@mui/material/Pagination";
import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../../components/language/Localization";
import { fetchData, postData } from "../../config/ServiceApi/serviceApi";
import Card from "../../components/cards/cards";
import LeafletMap from "../../components/map/map";
import SearchFilters from "../../components/searchFilters/SearchFilters";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/context";
import usePageTitle from "../../hooks/usePageTitle";
import Property360Viewer from "../../components/360/Property360Viewer";
import CtaSection from "../../components/cta/CtaSection";
import { useNavigate } from "react-router-dom";
import Img from "../../assets/images/new-york-city-manhattan.jpg"

import TrustBadges from "../../components/home/TrustBadges";
import CategoriesSection from "../../components/home/CategoriesSection";
import FeaturedLocations from "../../components/home/FeaturedLocations";
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
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle("Home");
  const [searchError, setSearchError] = useState(false);
  const { searchParams } = useAppContext(); // Get searchParams from context
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

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

    const user = getAuthUser();
    if (user?._id) {
      query.append("excludeHostId", user._id);
    }

    return query.toString();
  }, []);

  const performSearch = useCallback(
    async (currentFilters = filters, pageNumber = 1, append = false) => {

      if (!append && pageNumber === 1 && listings.length === 0) {
        setInitialLoading(true);
      }

      setLoading(true);
      try {
        const queryString = buildQuery(currentFilters);

        const data = await fetchData(
          `api/listings/search?${queryString}&page=${pageNumber}&limit=10`
        );

        setTotalCount(data.totalCount || 0);

        const isMasterPageEnd = pageNumber % 3 === 0;
        setHasMore(pageNumber < data.totalPages && !isMasterPageEnd);

        setListings(prev =>
          append ? [...prev, ...(data.results || [])] : (data.results || [])
        );
      } catch (error) {
        setSearchError(true);
        setHasMore(false);
        toast.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [filters, buildQuery]
  );


  // Debounce filters search
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     performSearch(filters);
  //   }, 600);

  //   return () => clearTimeout(timer);
  // }, [
  //   filters.q,
  //   filters.priceRange,
  //   filters.amenities,
  //   filters.bounds,
  //   filters.polygon,
  //   performSearch,
  //   filters,
  // ]);

  useEffect(() => {
    setSearchError(false);
    setPage(1);
    setHasMore(true);
    performSearch(filters, 1, false);
  }, [
    filters.q,
    filters.priceRange,
    filters.amenities,
    filters.bounds,
    filters.polygon
  ]);


  // AI Search Handler
  const handleAiSearch = async (query) => {
    toast.loading("AI is finding the best spots...", { id: "ai-search" });

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const body = { query };
      if (user?._id) body.excludeHostId = user._id;

      const res = await postData("api/search/ai", body);

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

  const observerRef = React.useRef(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore && !searchError) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading]);


  useEffect(() => {
    if (page === 1) return;
    performSearch(filters, page, page % 3 !== 1);
  }, [page]);

  const isRTL = useRTL();

  return (
    <RTLWrapper sx={{ minHeight: "100vh", pb: 6, bgcolor: "var(--bg-primary)" }}>
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
                {t("translation:home:showMap") || "Map"}
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
              height: { xs: 450, md: 500 }, // Slightly taller on mobile for better button fit
              transition: "all 0.30s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: { xs: 2, md: 4 },
              bgcolor: "var(--bg-secondary)",
              overflow: "hidden", // Prevent image bleed
              zIndex: 1, // Keep it below fixed navbar
              mt: { xs: "0px", md: 0 }, // Ensure no gap if nav is fixed
            }}
          >
            {/* 360 Viewer Background */}
            <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <Property360Viewer
                // Using a default 360 image for the home page hero since we don't have a specific property
                imageUrl={Img}
                isHero={true}
              />
            </Box>

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.35)",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",

                px: { xs: 1.5, md: 2 },
              }}
            >

              <Typography
                color="white"
                fontWeight={900}
                sx={{
                  mb: { xs: 1.5, md: 3 },
                  textAlign: "center",

                  fontSize: {
                    xs: "1.2rem",   // mobile
                    sm: "1.6rem",
                    md: listings.length > 0 ? "3rem" : "3.6rem",
                  },

                  lineHeight: 1.2,
                  px: 2,
                  zIndex: 2,
                }}
              >
                {t("homepage:title")}
              </Typography>
              <Typography
                color="rgba(255,255,255,0.9)"
                variant="h6"
                sx={{
                  mb: { xs: 3, md: 5 },
                  textAlign: "center",
                  fontWeight: 500,
                  zIndex: 2,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}
              >
                {t("homepage:subtitle")}
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  zIndex: 2,
                  mb: { xs: 4, md: 4 },
                  width: { xs: "auto", sm: "auto" },
                  px: { xs: 2, sm: 0 },
                  justifyContent: 'center',
                  flexDirection: isRTL ? 'row-reverse' : 'row'
                }}
              >
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    bgcolor: "#FF385C",
                    color: "white",
                    fontWeight: 800,
                    px: { xs: 2, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    borderRadius: "999px",
                    textTransform: "none",
                    whiteSpace: 'nowrap',
                    fontSize: { xs: "0.8rem", md: "1.05rem" },
                    boxShadow: "0 8px 20px rgba(255, 56, 92, 0.3)",
                    "&:hover": { bgcolor: "#E31C5F" }
                  }}
                  onClick={() => {
                    const listingsSection = document.getElementById("listings-section");
                    if (listingsSection) {
                      listingsSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {t("common:browseProperties")}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    fontWeight: 800,
                    px: { xs: 2, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    borderRadius: "999px",
                    textTransform: "none",
                    borderWidth: 2,
                    fontSize: { xs: "0.8rem", md: "1.05rem" },
                    backdropFilter: "blur(5px)",
                    whiteSpace: 'nowrap',
                    backgroundColor: "rgba(255,255,255,0.05)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.8)",
                      bgcolor: "rgba(255,255,255,0.15)",
                      borderWidth: 2
                    }
                  }}
                  onClick={() => navigate("/hosting/today")}
                >
                  {t("common:listProperty")}
                </Button>

              </Stack>


              <Box
                sx={{
                  width: "100%",
                  maxWidth: 800,
                  px: { xs: 0, md: 2 },
                }}
              >
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

          <Container maxWidth="xl" id="listings-section">
            <Grid container spacing={2}>
              {initialLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={6} sm={6} md={4} lg={3} key={i}>
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
                      {t("translation:home:noListingsPresent") || "No listings found"}
                    </Typography>
                    <Typography variant="body2" color="var(--text-secondary)">
                      Try adjusting your filters or area.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                listings.map((item) => (
                  <Grid item xs={6} sm={6} md={4} lg={3} key={item._id}>
                    <MemoizedCard data={item} />
                  </Grid>
                ))
              )}
              {hasMore && <div ref={observerRef} style={{ height: 1 }} />}
              {loading && page > 1 && (
                Array.from({ length: 4 }).map((_, i) => (
                  <Grid item xs={6} sm={6} md={4} lg={3} key={`loading-${i}`}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                      }}
                    >
                      <Skeleton variant="rectangular" height={220} />
                      <Box sx={{ p: 2 }}>
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="50%" />
                      </Box>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
            {Math.ceil(totalCount / 30) > 1 && !hasMore && !loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                  mb: 4,
                  width: "100%",
                }}
              >
                <Pagination
                  count={Math.ceil(totalCount / 30)}
                  page={Math.ceil(page / 3)}
                  onChange={(e, value) => {
                    const targetPage = (value - 1) * 3 + 1;
                    setPage(targetPage);

                    if (targetPage === 1) {
                      performSearch(filters, 1, false);
                    }

                    const listSection = document.getElementById("listings-section");
                    if (listSection) {
                      listSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  color="primary"
                  size={isMobile ? "small" : "large"}
                  sx={(theme) => ({
                    "& .MuiPagination-ul": {
                      flexWrap: "nowrap",
                      justifyContent: "center",
                    },
                    "& .MuiPaginationItem-root": {
                      fontWeight: 800,
                      fontSize: isMobile ? "0.85rem" : "1rem",
                      color:
                        theme.palette.mode === "dark"
                          ? "#fff"
                          : "var(--text-primary)",
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid rgba(255,255,255,0.2)"
                          : "1px solid rgba(0,0,0,0.2)",
                      minWidth: isMobile ? 32 : 40,
                      height: isMobile ? 32 : 40,
                    },

                    "& .Mui-selected": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.main
                          : theme.palette.primary.light,
                      color: "#fff",
                    },

                    "& .MuiPaginationItem-ellipsis": {
                      color:
                        theme.palette.mode === "dark"
                          ? "#aaa"
                          : theme.palette.text.secondary,
                    },
                  })}
                />
              </Box>
            )}
          </Container>

          <CategoriesSection />

          <FeaturedLocations />

          <TrustBadges />
          <CtaSection />
        </>
      )
      }

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
        {mapVisible ? (t("translation:home:showList") || "Show List") : (t("translation:home:showMap") || "Map")}
      </Button>
    </RTLWrapper >
  );
};

export default Home;
