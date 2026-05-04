import React, { useEffect, useState, useCallback, useRef } from "react";
import { getAuthUser } from "../../utils/cookieUtils";
import {
  Box,
  Button,
  Grid,
  Typography,
  Container,
  Paper,
  Stack,
  IconButton,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ViewListIcon from "@mui/icons-material/ViewList";
import CloseIcon from "@mui/icons-material/Close";
import Pagination from "@mui/material/Pagination";
import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../../components/language/Localization";
import { fetchData, postData } from "../../config/ServiceApi/serviceApi";
import Card from "../../components/cards/cards";
import MapView from "../../components/map/MapView";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/context";
import usePageTitle from "../../hooks/usePageTitle";
import Property360Viewer from "../../components/360/Property360Viewer";
import CtaSection from "../../components/cta/CtaSection";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Img from "../../assets/images/new-york-city-manhattan.jpg";
import TrustBadges from "../../components/home/TrustBadges";
import CategoriesSection from "../../components/home/CategoriesSection";
import FeaturedLocations from "../../components/home/FeaturedLocations";
import SectionCarousel from "../../components/home/SectionCarousel";
import PremiumSearchBar from "../../components/searchBar/PremiumSearchBar";
import MobileBottomNav from "../../components/home/MobileBottomBar";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

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

/* ---------- Skeleton Card for Grid View ---------- */
const SkeletonCard = () => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "20px",
      border: "1px solid var(--border-light)",
      overflow: "hidden",
      bgcolor: "var(--bg-card)",
    }}
  >
    <Skeleton
      variant="rectangular"
      height={220}
      sx={{
        bgcolor: "var(--bg-secondary)",
        "&::after": { background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" },
      }}
    />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="70%" height={22} sx={{ bgcolor: "var(--bg-secondary)", mb: 0.5 }} />
      <Skeleton variant="text" width="90%" height={16} sx={{ bgcolor: "var(--bg-secondary)" }} />
      <Skeleton variant="text" width="45%" height={20} sx={{ bgcolor: "var(--bg-secondary)", mt: 1 }} />
    </Box>
  </Paper>
);

const Home = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["common", "homepage", "translation"]);
  usePageTitle(t("common:Home") || "Home");

  const [searchError, setSearchError] = useState(false);
  const { searchParams } = useAppContext();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const { globalMapVisible: mapVisible, setGlobalMapVisible: setMapVisible } = useAppContext();

  // Section-specific states
  const [trendingCity, setTrendingCity] = useState("Karachi");
  const [trendingListings, setTrendingListings] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [topRatedListings, setTopRatedListings] = useState([]);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [luxuryListings, setLuxuryListings] = useState([]);
  const [luxuryLoading, setLuxuryLoading] = useState(true);
  const [recentListings, setRecentListings] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem("searchFilters");
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  const [searchAsMove, setSearchAsMove] = useState(false);

  // Sync Global Search Bar with Local Filters
  useEffect(() => {
    if (!searchParams || Object.keys(searchParams).length === 0) {
      setFilters(DEFAULT_FILTERS);
      return;
    }
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

  const buildQuery = useCallback((currentFilters, extraParams = {}) => {
    const query = new URLSearchParams();
    if (currentFilters.q) query.append("q", currentFilters.q);
    if (typeof currentFilters.guests === "number" && !isNaN(currentFilters.guests)) {
      query.append("guests", currentFilters.guests);
    }
    if (currentFilters.checkIn) query.append("checkIn", currentFilters.checkIn);
    if (currentFilters.checkOut) query.append("checkOut", currentFilters.checkOut);
    if (currentFilters.priceRange) {
      query.append("minPrice", currentFilters.priceRange[0]);
      query.append("maxPrice", currentFilters.priceRange[1]);
    }
    if (currentFilters.amenities?.length) {
      query.append("amenities", currentFilters.amenities.join(","));
    }
    if (currentFilters.bounds) query.append("bounds", JSON.stringify(currentFilters.bounds));
    if (currentFilters.polygon) query.append("polygon", JSON.stringify(currentFilters.polygon));
    // Allow overriding sortBy from extraParams
    query.append("sortBy", extraParams.sortBy || "recommended");
    if (extraParams.minRating) query.append("minRating", extraParams.minRating);
    if (extraParams.minPrice) { query.set("minPrice", extraParams.minPrice); }
    if (extraParams.maxPrice) { query.set("maxPrice", extraParams.maxPrice); }
    if (extraParams.city) query.append("q", extraParams.city);
    const user = getAuthUser();
    if (user?._id) query.append("excludeHostId", user._id);
    return query.toString();
  }, []);

  // Main search (for active filters / search mode)
  const performSearch = useCallback(
    async (currentFilters, pageNumber = 1, append = false) => {
      if (!append && pageNumber === 1) setInitialLoading(true);
      setLoading(true);
      try {
        const queryString = buildQuery(currentFilters);
        const searchLimit = mapVisible ? 100 : 12;
        const data = await fetchData(
          `api/listings/search?${queryString}&page=${pageNumber}&limit=${searchLimit}`
        );
        setTotalCount(data.totalCount || 0);
        const isMasterPageEnd = pageNumber % 3 === 0;
        setHasMore(pageNumber < data.totalPages && !isMasterPageEnd);
        setListings((prev) =>
          append ? [...prev, ...(data.results || [])] : data.results || []
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
    [buildQuery, mapVisible]
  );

  // Fetch a section independently
  const fetchSection = useCallback(async (extraParams, setData, setLoad) => {
    setLoad(true);
    try {
      const user = getAuthUser();
      const q = new URLSearchParams();
      if (extraParams.city) q.append("q", extraParams.city);
      if (extraParams.sortBy) q.append("sortBy", extraParams.sortBy);
      if (extraParams.minRating) q.append("minRating", extraParams.minRating);
      if (extraParams.minPrice) q.append("minPrice", extraParams.minPrice);
      if (extraParams.maxPrice) q.append("maxPrice", extraParams.maxPrice);
      q.append("limit", "10");
      q.append("page", "1");
      if (user?._id) q.append("excludeHostId", user._id);
      const data = await fetchData(`api/listings/search?${q.toString()}`);
      setData(data.results || []);
    } catch {
      setData([]);
    } finally {
      setLoad(false);
    }
  }, []);

  // Detect user city via browser geolocation + reverse geocode
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const geo = await res.json();
            const city =
              geo?.address?.city ||
              geo?.address?.town ||
              geo?.address?.state_district ||
              "Karachi";
            setTrendingCity(city);
          } catch {
            setTrendingCity("Karachi");
          }
        },
        () => setTrendingCity("Karachi")
      );
    }
  }, []);

  // Fetch trending by city — keep old data visible during re-fetch, fall back to Karachi if empty
  useEffect(() => {
    let cancelled = false;
    setTrendingLoading(true);
    (async () => {
      try {
        const user = getAuthUser();
        const q = new URLSearchParams();
        q.append("q", trendingCity);
        q.append("sortBy", "recommended");
        q.append("limit", "10");
        q.append("page", "1");
        if (user?._id) q.append("excludeHostId", user._id);
        const data = await fetchData(`api/listings/search?${q.toString()}`);
        if (cancelled) return;
        const results = data.results || [];
        if (results.length > 0) {
          setTrendingListings(results);
        } else if (trendingCity !== "Karachi") {
          // Detected city has no listings — fall back to Karachi
          const fallbackQ = new URLSearchParams();
          fallbackQ.append("q", "Karachi");
          fallbackQ.append("sortBy", "recommended");
          fallbackQ.append("limit", "10");
          fallbackQ.append("page", "1");
          if (user?._id) fallbackQ.append("excludeHostId", user._id);
          const fallback = await fetchData(`api/listings/search?${fallbackQ.toString()}`);
          if (!cancelled) setTrendingListings(fallback.results || []);
        }
        // If Karachi also empty, listings stay as whatever they were (skeleton → nothing shown)
      } catch {
        // keep previous listings on error
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [trendingCity]);

  useEffect(() => {
    fetchSection({ sortBy: "topRated", minRating: 4 }, setTopRatedListings, setTopRatedLoading);
    fetchSection({ sortBy: "recommended", minPrice: 15000 }, setLuxuryListings, setLuxuryLoading);
    fetchSection({ sortBy: "newest" }, setRecentListings, setRecentLoading);
  }, [fetchSection]);

  // Re-run main search when filters change (use JSON.stringify for deep compare)
  useEffect(() => {
    setSearchError(false);
    setPage(1);
    setHasMore(true);
    performSearch(filters, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.q,
    JSON.stringify(filters.priceRange),
    JSON.stringify(filters.amenities),
    JSON.stringify(filters.bounds),
    JSON.stringify(filters.polygon),
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
        newFilters.bounds = null;
        newFilters.polygon = null;
        setFilters(newFilters);
        toast.success("Filters applied by AI!", { id: "ai-search" });
        if (res.results) setListings(res.results);
      } else {
        toast.error("AI could not understand.", { id: "ai-search" });
      }
    } catch (e) {
      toast.error("AI could not understand.", { id: "ai-search" });
    }
  };

  const handleBoundsChange = (bounds) => {
    if (!searchAsMove) return;
    setFilters((prev) => ({ ...prev, bounds, polygon: null }));
  };

  const handleDrawCreated = (coords) => {
    setFilters((prev) => ({ ...prev, polygon: coords, bounds: null }));
    toast.success("Searching within drawn area");
  };

  const toggleMapVisibility = () => {
    setMapVisible((prev) => {
      const next = !prev;
      // Re-trigger search with new limit when opening map
      if (next) {
        performSearch(filters, 1, false);
      }
      return next;
    });
  };

  const observerRef = useRef(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && !searchError) {
          setPage((prev) => prev + 1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const isRTL = useRTL();

  const hasActiveSearch =
    filters.q ||
    filters.priceRange?.[1] < 100000 ||
    filters.amenities?.length > 0;

  return (
    <RTLWrapper sx={{ minHeight: "100vh", bgcolor: "var(--bg-primary)" }}>
      {/* ===================== STICKY FILTER BAR ===================== */}
      {/* <StickyFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        scrollThreshold={380}
      /> */}

      {/* ===================== MAP OVERLAY VIEW ===================== */}
      <AnimatePresence>
        {mapVisible && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
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

            <MapView
              listings={listings}
              latitude={listings?.[0]?.latitude || 24.8607}
              longitude={listings?.[0]?.longitude || 67.0011}
              searchAsMove={searchAsMove}
              onBoundsChange={handleBoundsChange}
            />
          </MotionBox>
        )}
      </AnimatePresence>


      {!mapVisible && (
        <>
          {/* ===================== HERO SECTION ===================== */}
          <Box
            sx={{
              position: "relative",
              height: { xs: 620, md: 680 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* 360 Background */}
            <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <Property360Viewer imageUrl={Img} isHero={true} />
            </Box>

            {/* Multi-layer dark overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.52) 60%, rgba(0,0,0,0.72) 100%)",
              }}
            />

            {/* Hero Content */}
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                maxWidth: 900,
                mx: "auto",
                px: { xs: 2, md: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: 1.5, md: 2 },
                pt: { xs: 2, md: 0 },
              }}
            >
              {/* Overline */}
              <MotionBox
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "rgba(255,56,92,0.15)",
                    border: "1px solid rgba(255,56,92,0.3)",
                    borderRadius: "999px",
                    px: 2,
                    py: 0.6,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#FF385C",
                      boxShadow: "0 0 8px #FF385C",
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontSize: "0.65rem",
                    }}
                  >
                    {t("homepage:overline") || "Pakistan's #1 Property Marketplace"}
                  </Typography>
                </Box>
              </MotionBox>

              {/* Heading */}
              <MotionTypography
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  textAlign: "center",
                  fontSize: { xs: "1.9rem", sm: "2.8rem", md: "3.8rem" },
                  lineHeight: { xs: 1.2, md: 1.1 },
                  letterSpacing: "-0.03em",
                  textShadow: "0 4px 24px rgba(0,0,0,0.4)",
                  maxWidth: 780,
                }}
              >
                {t("homepage:titlePart1", "Find premium stays")}{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #FF385C 0%, #FF6B35 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t("homepage:titlePart2", "tailored for you")}
                </Box>
              </MotionTypography>

              {/* Subtitle */}
              <MotionTypography
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.78)",
                  textAlign: "center",
                  fontWeight: 400,
                  fontSize: { xs: "0.95rem", md: "1.15rem" },
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  maxWidth: 560,
                }}
              >
                {t("homepage:subtitle") ||
                  "Discover verified properties across Pakistan — from beachside villas to mountain retreats."}
              </MotionTypography>

              {/* Search Bar */}
              <Box sx={{ width: "100%", mt: { xs: 0.5, md: 1 } }}>
                <PremiumSearchBar
                  filters={filters}
                  onFilterChange={setFilters}
                  onAiSearch={handleAiSearch}
                  searchAsMove={searchAsMove}
                  onClear={() => setFilters(DEFAULT_FILTERS)}
                  isHero={true}
                />
              </Box>

              {/* CTA Buttons */}
              <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexDirection: isRTL ? "row-reverse" : "row",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    const el = document.getElementById("listings-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  sx={{
                    bgcolor: "#FF385C",
                    color: "white",
                    fontWeight: 800,
                    px: { xs: 2.5, md: 4 },
                    py: { xs: 1.2, md: 1.4 },
                    borderRadius: "999px",
                    textTransform: "none",
                    fontSize: { xs: "0.85rem", md: "1rem" },
                    boxShadow: "0 8px 24px rgba(255,56,92,0.35)",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: "#E0284F",
                      transform: "translateY(-1px)",
                      boxShadow: "0 12px 32px rgba(255,56,92,0.45)",
                    },
                    "&:active": { transform: "scale(0.97)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  {t("common:browseProperties") || "Browse Properties"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/hosting/today")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "white",
                    fontWeight: 700,
                    px: { xs: 2.5, md: 4 },
                    py: { xs: 1.2, md: 1.4 },
                    borderRadius: "999px",
                    textTransform: "none",
                    borderWidth: "1.5px",
                    fontSize: { xs: "0.85rem", md: "1rem" },
                    backdropFilter: "blur(8px)",
                    whiteSpace: "nowrap",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.7)",
                      bgcolor: "rgba(255,255,255,0.13)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {t("common:listProperty") || "List Your Property"}
                </Button>
              </MotionBox>
            </Box>

            {/* Bottom fade */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 48,
                background:
                  "linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)",
                zIndex: 2,
                pointerEvents: "none",
                opacity: 0.7,
              }}
            />
          </Box>

          {/* ===================== MAIN CONTENT ===================== */}
          <Container maxWidth="xl" id="listings-section" sx={{ pt: { xs: 3, md: 5 } }}>

            {/* --- SEARCH-MODE: flat grid --- */}
            {hasActiveSearch ? (
              <>
                {/* Search results header */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                  >
                    {initialLoading
                      ? t("homepage:searchResults.searching")
                      : filters.q
                        ? t("homepage:searchResults.foundIn", { count: totalCount, query: filters.q })
                        : t("homepage:searchResults.found", { count: totalCount })}
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  {initialLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={i}>
                        <SkeletonCard />
                      </Grid>
                    ))
                    : listings.length === 0
                      ? (
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              py: 10,
                              textAlign: "center",
                            }}
                          >
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5, color: "var(--text-primary)" }}>
                              {t("homepage:searchResults.noResults")}
                            </Typography>
                            <Typography variant="body1" sx={{ color: "var(--text-secondary)", mb: 3 }}>
                              {t("homepage:searchResults.noResultsSubtitle")}
                            </Typography>
                            <Button
                              variant="contained"
                              onClick={() => setFilters(DEFAULT_FILTERS)}
                              sx={{
                                bgcolor: "#222",
                                color: "#fff",
                                borderRadius: "999px",
                                px: 4,
                                textTransform: "none",
                                fontWeight: 700,
                                "&:hover": { bgcolor: "#FF385C" },
                              }}
                            >
                              {t("homepage:searchResults.clearFilters")}
                            </Button>
                          </Box>
                        </Grid>
                      )
                      : listings.map((item) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} key={item._id}>
                          <MemoizedCard data={item} />
                        </Grid>
                      ))}

                  {hasMore && <div ref={observerRef} style={{ height: 1, width: "100%" }} />}

                  {loading && page > 1 &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={`loading-${i}`}>
                        <SkeletonCard />
                      </Grid>
                    ))}
                </Grid>

                {/* Pagination */}
                {Math.ceil(totalCount / 30) > 1 && !hasMore && !loading && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 5, mb: 4 }}>
                    <Pagination
                      count={Math.ceil(totalCount / 30)}
                      page={Math.ceil(page / 3)}
                      onChange={(e, value) => {
                        const targetPage = (value - 1) * 3 + 1;
                        setPage(targetPage);
                        if (targetPage === 1) performSearch(filters, 1, false);
                        document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      color="primary"
                      size={isMobile ? "small" : "large"}
                      sx={(theme) => ({
                        "& .MuiPagination-ul": { flexWrap: "nowrap", justifyContent: "center" },
                        "& .MuiPaginationItem-root": {
                          fontWeight: 800,
                          fontSize: isMobile ? "0.85rem" : "1rem",
                          color: theme.palette.mode === "dark" ? "#fff" : "var(--text-primary)",
                          border: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)",
                          minWidth: isMobile ? 32 : 40,
                          height: isMobile ? 32 : 40,
                        },
                        "& .Mui-selected": {
                          backgroundColor: "#FF385C !important",
                          color: "#fff !important",
                        },
                      })}
                    />
                  </Box>
                )}
              </>
            ) : (
              /* --- BROWSE-MODE: independent section carousels --- */
              <>
                <SectionCarousel
                  title={t("homepage:sections.trending", { city: trendingCity })}
                  subtitle={t("homepage:sections.trendingSubtitle")}
                  listings={trendingListings}
                  loading={trendingLoading}
                />

                <SectionCarousel
                  title={t("homepage:sections.topRated")}
                  subtitle={t("homepage:sections.topRatedSubtitle")}
                  listings={topRatedListings}
                  loading={topRatedLoading}
                />

                <SectionCarousel
                  title={t("homepage:sections.luxury")}
                  subtitle={t("homepage:sections.luxurySubtitle")}
                  listings={luxuryListings}
                  loading={luxuryLoading}
                />

                <SectionCarousel
                  title={t("homepage:sections.recentlyAdded")}
                  subtitle={t("homepage:sections.recentlyAddedSubtitle")}
                  listings={recentListings}
                  loading={recentLoading}
                />
              </>
            )}
          </Container>

          <CategoriesSection />
          <FeaturedLocations />
          <TrustBadges />
          <CtaSection />

          {/* Mobile bottom padding for bottom bar */}
          <Box sx={{ display: { xs: "block", md: "none" }, height: 64 }} />
        </>
      )}

      {/* ===================== FLOATING MAP / LIST TOGGLE (DESKTOP) ===================== */}
      <Button
        variant="contained"
        onClick={toggleMapVisibility}
        startIcon={mapVisible ? <ViewListIcon /> : <MapIcon />}
        sx={{
          display: { xs: "none", md: "inline-flex" },
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          borderRadius: 999,
          px: 3.5,
          py: 1.5,
          fontWeight: 900,
          textTransform: "none",
          fontSize: "0.95rem",
          bgcolor: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          "&:hover": {
            bgcolor: "#FF385C",
            transform: "translateX(-50%) translateY(-2px)",
            boxShadow: "0 18px 50px rgba(255,56,92,0.35)",
          },
          transition: "all 0.25s ease",
        }}
      >
        {mapVisible
          ? t("translation:home:showList") || "Show List"
          : t("translation:home:showMap") || "Map"}
      </Button>

      {/* ===================== MOBILE BOTTOM NAV ===================== */}
      <MobileBottomNav />
    </RTLWrapper>
  );
};

export default Home;
