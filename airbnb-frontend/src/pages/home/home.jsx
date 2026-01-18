import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Grid, Skeleton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { fetchData } from "../../config/ServiceApi/serviceApi";
import { useAppContext } from "../../context/context";
import Card from "../../components/cards/cards";
import LeafletMap from "../../components/map/map";

// Memoize Card component to prevent unnecessary re-renders
const MemoizedCard = React.memo(({ data }) => <Card data={data} />);

const Home = () => {
  const { t } = useTranslation();
  const [listing, setListing] = useState([]); // All listings
  const [filteredData, setFilteredData] = useState([]); // Filtered listings
  const [loading, setLoading] = useState(true); // Indicates if initial data is loading
  const [loadingMore, setLoadingMore] = useState(false); // Tracks if more data is loading
  const [mapVisible, setMapVisible] = useState(false);
  const [showMapButton, setShowMapButton] = useState(true);
  const [page, setPage] = useState(1); // Start from page 1
  const [limit] = useState(6); // Items per page
  const [hasMoreData, setHasMoreData] = useState(true); // Flag to track if more data exists

  const { searchParams } = useAppContext();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Function to load and filter data based on searchParams
  useEffect(() => {
    if (listing?.length === 0) {
      setFilteredData([]);
      return;
    }

    if (
      !searchParams ||
      !searchParams.destination ||
      !searchParams.checkIn ||
      !searchParams.checkOut
    ) {
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

        const isOverlap =
          checkInDate < bookingEnd && checkOutDate > bookingStart;
        return isOverlap;
      });

      const guests = searchParams.guests <= product.guestCapacity;

      return cityMatches && isAvailable && guests;
    });

    setFilteredData(filteredProducts);
  }, [searchParams, listing]);

  // Fetch data on page change
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingMore(true); // Set loadingMore to true when starting to fetch new data
        const response = await fetchData(
          `all-listring?page=${page}&limit=${limit}${token ? `&userId=${user._id}` : ""}`,
          token
        );
        console.log(page);
        
        console.log(response);

        // Check if the new listings are already in the current list
        if (response.listings.length > 0) {
          setListing((prevListing) => {
            const newListings = response.listings.filter(
              (newItem) => !prevListing.some((item) => item._id === newItem._id)
            );
            return [...prevListing, ...newListings];
          });

          setFilteredData((prevFilteredData) => {
            const newFilteredData = response.listings.filter(
              (newItem) => !prevFilteredData.some((item) => item._id === newItem._id)
            );
            return [...prevFilteredData, ...newFilteredData];
          });

          setHasMoreData(true); 
        } else {
          setHasMoreData(false); // Set flag to false if no new data is received
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
        setHasMoreData(false);
        setLoading(false);
      } finally {
        setLoading(false); // Set loading to false when data is fetched
        setLoadingMore(false); // Set loadingMore to false when new data is loaded
      }
    };

    if (hasMoreData && !loadingMore) {
      fetchOptions();
    }
  }, [page, token, limit, hasMoreData]);

  // Memoize toggleMapVisibility function to prevent re-creation on every render
  const toggleMapVisibility = useCallback(() => {
    setMapVisible((prev) => !prev);
  }, []);

  // Memoize handleScroll function to prevent re-creation on every render
  const handleScroll = useCallback(() => {
    const footerHeight = 280;
    const scrollY = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    setShowMapButton(scrollY < documentHeight - footerHeight);

    // Trigger fetch when user reaches the bottom
    if (scrollY >= documentHeight - footerHeight && !loadingMore && hasMoreData) {
      setPage((prevPage) => prevPage + 1); // Increment page number
    }
  }, [loadingMore, hasMoreData]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div>
      {mapVisible ? (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            height: "100vh",
            transition: "height 0.3s ease-in-out",
          }}
        >
          <LeafletMap
            latitude={filteredData[0]?.latitude || 24.8607}
            longitude={filteredData[0]?.longitude || 67.0011}
            steps={true}
          />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Grid container spacing={2}>
            {loading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Box
                    sx={{
                      height: 380,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={220}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={32}
                      sx={{ mt: 1, mx: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mt: 1, mx: 2 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                        mx: 2,
                      }}
                    >
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton
                        variant="text"
                        width="30%"
                        height={20}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))
            ) : listing?.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="h6" align="center" color="text.secondary">
                  {t("home.noListingsPresent")}
                </Typography>
              </Grid>
            ) : (
              filteredData?.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                  <MemoizedCard data={item} />
                </Grid>
              ))
            )}

            {/* Show Skeletons while loading next page only if there's more data */}
            {loadingMore && hasMoreData &&
              Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
                  <Box
                    sx={{
                      height: 380,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={220}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={32}
                      sx={{ mt: 1, mx: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mt: 1, mx: 2 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                        mx: 2,
                      }}
                    >
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton
                        variant="text"
                        width="30%"
                        height={20}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {showMapButton && (
        <Button
          variant="contained"
          color="primary"
          sx={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "25px",
            padding: 1.5,
            boxShadow: 2,
            zIndex: 10,
            backgroundColor: "#222222",
            paddingLeft: "25px",
            paddingRight: "25px",
            fontSize: "12px",
          }}
          onClick={toggleMapVisibility}
        >
          {mapVisible ? t("home.showList") : t("home.showMap")}
        </Button>
      )}
    </div>
  );
};

export default Home;
