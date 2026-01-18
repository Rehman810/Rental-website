import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Skeleton,
  Typography,
  Container,
  Paper,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ViewListIcon from "@mui/icons-material/ViewList";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { fetchData } from "../../config/ServiceApi/serviceApi";
import { useAppContext } from "../../context/context";
import Card from "../../components/cards/cards";
import LeafletMap from "../../components/map/map";

const MemoizedCard = React.memo(({ data }) => <Card data={data} />);

const Home = () => {
  const { t } = useTranslation();
  const { searchParams } = useAppContext();

  const [listing, setListing] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [mapVisible, setMapVisible] = useState(false);
  const [showMapButton, setShowMapButton] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 6;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ✅ Filtered results label
  const activeSearchLabel = useMemo(() => {
    if (!searchParams?.destination) return null;
    return searchParams.destination?.split(",")[0]?.trim();
  }, [searchParams]);

  // Filter logic
  useEffect(() => {
    if (!listing?.length) {
      setFilteredData([]);
      return;
    }

    if (!searchParams?.destination || !searchParams?.checkIn || !searchParams?.checkOut) {
      setFilteredData(listing);
      return;
    }

    const filteredProducts = listing.filter((product) => {
      const cityMatches =
        searchParams?.destination?.split(",")[0]?.trim().toLowerCase() ===
        product.city?.trim().toLowerCase();

      const checkInDate = new Date(searchParams.checkIn);
      const checkOutDate = new Date(searchParams.checkOut);

      const isAvailable = !product?.bookings?.some((booking) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        return checkInDate < bookingEnd && checkOutDate > bookingStart;
      });

      const guestsOk = searchParams.guests <= product.guestCapacity;

      return cityMatches && isAvailable && guestsOk;
    });

    setFilteredData(filteredProducts);
  }, [searchParams, listing]);

  // Fetch on page change
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingMore(true);

        const response = await fetchData(
          `all-listring?page=${page}&limit=${limit}${token ? `&userId=${user?._id}` : ""}`,
          token
        );

        const newList = response?.listings || [];

        if (newList.length > 0) {
          setListing((prev) => {
            const unique = newList.filter((n) => !prev.some((p) => p._id === n._id));
            return [...prev, ...unique];
          });

          setHasMoreData(true);
        } else {
          setHasMoreData(false);
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        setHasMoreData(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    if (hasMoreData && !loadingMore) fetchOptions();
  }, [page]);

  const toggleMapVisibility = useCallback(() => {
    setMapVisible((prev) => !prev);
  }, []);

  const handleScroll = useCallback(() => {
    const footerHeight = 280;
    const scrollY = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    setShowMapButton(scrollY < documentHeight - footerHeight);

    if (scrollY >= documentHeight - footerHeight && !loadingMore && hasMoreData) {
      setPage((prev) => prev + 1);
    }
  }, [loadingMore, hasMoreData]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      {/* MAP VIEW */}
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
                {t("home.showMap")}
              </Typography>
              <IconButton size="small" onClick={toggleMapVisibility}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>

          <LeafletMap
            latitude={filteredData?.[0]?.latitude || 24.8607}
            longitude={filteredData?.[0]?.longitude || 67.0011}
            steps={true}
          />
        </Box>
      ) : (
        // LIST VIEW
        <Container maxWidth="xl" sx={{ pt: 2 }}>
          {/* Grid */}
          <Grid container spacing={2.2}>
            {loading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      overflow: "hidden",
                    }}
                  >
                    <Skeleton variant="rectangular" width="100%" height={220} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="text" width="75%" height={28} />
                      <Skeleton variant="text" width="90%" height={18} />
                      <Skeleton variant="text" width="50%" height={18} />
                    </Box>
                  </Paper>
                </Grid>
              ))
            ) : filteredData?.length === 0 ? (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={900}>
                    No stays found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                    Try changing your dates, destination or guest count.
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              filteredData?.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                  <MemoizedCard data={item} />
                </Grid>
              ))
            )}

            {/* Loading more skeletons */}
            {loadingMore &&
              hasMoreData &&
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`more-${index}`}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      overflow: "hidden",
                    }}
                  >
                    <Skeleton variant="rectangular" width="100%" height={220} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="text" width="75%" height={28} />
                      <Skeleton variant="text" width="90%" height={18} />
                      <Skeleton variant="text" width="50%" height={18} />
                    </Box>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </Container>
      )}

      {/* Floating Map Toggle Button */}
      {(mapVisible || showMapButton) && (
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
            px: 2.6,
            py: 1.2,
            fontWeight: 900,
            textTransform: "none",
            boxShadow: "0 14px 35px rgba(0,0,0,0.20)",
          }}
        >
          {mapVisible ? t("home.showList") : t("home.showMap")}
        </Button>
      )}

    </Box>
  );
};

export default Home;
