import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Divider,
  Button,
} from "@mui/material";
import { fetchData } from "../../config/ServiceApi/serviceApi";
import { useBookingContext } from "../../context/booking";
import { SentimentDissatisfied } from "@mui/icons-material"; // Icon for no data

const CurrrentlyHosting = () => {
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { setCurrentlyHosting } = useBookingContext();

  useEffect(() => {
    const fetchCheckouts = async () => {
      try {
        const response = await fetchData("currently-hosting", token);
        setCheckouts(response.currentlyHostingBookings);
        setCurrentlyHosting(response.count);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckouts();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" sx={{ mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" color="textSecondary">
          Loading guests currently hosting...
        </Typography>
      </Box>
    );
  }

  if (checkouts.length === 0 || checkouts == undefined) {
    return (
      <Box textAlign="center" sx={{ mt: 5, p: 3 }}>
        <SentimentDissatisfied color="action" sx={{ fontSize: 50 }} />
        <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
          No guests currently hosting.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          You are not hosting any guests at the moment. Please check back later.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => window.location.reload()} // Refresh if needed
        >
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {checkouts.map((checkout) => (
        <Paper
          key={checkout.id}
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Grid container spacing={3} sx={{ alignItems: "center" }}>
            <Grid item xs={12} md={4}>
              <Box
                display="flex"
                flexDirection="column"
                gap={2}
                sx={{ alignItems: "center" }}
              >
                <img
                  src={checkout.listingId?.photos[0]}
                  alt={checkout.listingId.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <Typography variant="h6" fontWeight="bold" align="center">
                  {checkout.listingId.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                >
                  {checkout.listingId.city}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <Avatar
                  src={checkout.userSpecificData.photoProfile}
                  alt={checkout.userSpecificData.name}
                  sx={{ width: 72, height: 72 }}
                />
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {checkout.userSpecificData.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {`Guests: ${checkout.guestCapacity}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {`Phone: ${checkout.userSpecificData?.phoneNumber}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {`Email: ${checkout.userSpecificData?.email}`}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {`Check-in: ${new Date(
                    checkout.startDate
                  ).toLocaleDateString()}`}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {`Check-out: ${new Date(
                    checkout.endDate
                  ).toLocaleDateString()}`}
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {`Total: Rs${checkout.totalPrice}`}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

export default CurrrentlyHosting;
