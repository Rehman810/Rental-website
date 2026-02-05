import React, { useState, useEffect } from "react";
import { getAuthToken } from "../../utils/cookieUtils";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import { fetchData } from "../../config/ServiceApi/serviceApi";
import { useBookingContext } from "../../context/booking";
import { EventAvailable } from "@mui/icons-material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";


const Upcoming = () => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = getAuthToken();
  const { setUpcoming } = useBookingContext();

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const response = await fetchData("upcoming-bookings", token);
        setUpcomingBookings(response?.upcomingBookings || []);
        setUpcoming(response?.count || 0);
      } catch (error) {
        console.error("Failed to fetch upcoming bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [token, setUpcoming]);

  if (loading) {
    return (
      <Box
        sx={{
          py: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="var(--text-secondary)">
          Loading upcoming arrivals...
        </Typography>
      </Box>
    );
  }

  if (!upcomingBookings?.length) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 52, color: "var(--text-secondary)" }} />
        <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>
          No upcoming arrivals
        </Typography>
        <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
          There are no upcoming bookings scheduled right now. Check back later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack spacing={2}>
        {upcomingBookings.map((booking) => {
          const listing = booking?.listingId;
          const guest = booking?.userSpecificData;

          return (
            <Paper
              key={booking?._id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "var(--border-light)",
                background: "var(--bg-card)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "var(--shadow-md)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    {listing?.title || "Untitled Listing"}
                  </Typography>
                  <Typography variant="body2" color="var(--text-secondary)">
                    {listing?.city || "Pakistan"}
                  </Typography>
                </Box>

                <Chip
                  icon={<EventAvailable />}
                  label="Upcoming"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} alignItems="center">
                {/* Listing Image */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 180,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "var(--border-light)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    <img
                      src={listing?.photos?.[0] || "/fallback-image.jpg"}
                      alt={listing?.title || "Listing image"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      loading="lazy"
                      onError={(e) => (e.target.src = "/fallback-image.jpg")}
                    />
                  </Box>
                </Grid>

                {/* Guest Info */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      src={guest?.photoProfile}
                      alt={guest?.name || "Guest"}
                      sx={{
                        width: 56,
                        height: 56,
                        border: "2px solid",
                        borderColor: "var(--border-light)",
                      }}
                    />
                    <Box>
                      <Typography fontWeight={800}>
                        {guest?.name || "Guest"}
                      </Typography>
                      <Typography variant="body2" color="var(--text-secondary)">
                        Guests: {booking?.guestCapacity || 0}
                      </Typography>
                      <Typography variant="body2" color="var(--text-secondary)">
                        {guest?.phoneNumber || "Phone not provided"}
                      </Typography>
                      <Typography variant="body2" color="var(--text-secondary)">
                        {guest?.email || "Email not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Dates + Total */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "var(--border-light)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    <Typography variant="body2" color="var(--text-secondary)">
                      Check-in:{" "}
                      <b>{new Date(booking?.startDate).toLocaleDateString()}</b>
                    </Typography>
                    <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
                      Check-out:{" "}
                      <b>{new Date(booking?.endDate).toLocaleDateString()}</b>
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="body1" fontWeight={900} color="primary">
                      Total: Rs {booking?.totalPrice || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Upcoming;
