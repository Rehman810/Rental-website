import React, { useEffect, useState } from "react";
import { getAuthToken } from "../../utils/cookieUtils";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Divider,
  Button,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";

import { fetchData } from "../../config/ServiceApi/serviceApi";
import { useBookingContext } from "../../context/booking";
import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../language/Localization";


const CurrentlyHosting = () => {
  const { t } = useTranslation("translation");
  const isRTL = useRTL();
  const [hosting, setHosting] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = getAuthToken();
  const { setCurrentlyHosting } = useBookingContext();

  useEffect(() => {
    const fetchHosting = async () => {
      try {
        setLoading(true);
        const response = await fetchData("currently-hosting");

        const list = response?.currentlyHostingBookings || [];
        setHosting(list);
        setCurrentlyHosting(response?.count || list.length);
      } catch (err) {
        console.error("CurrentlyHosting fetch error:", err);
        setHosting([]);
        setCurrentlyHosting(0);
      } finally {
        setLoading(false);
      }
    };

    fetchHosting();
  }, [token, setCurrentlyHosting]);

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} fontWeight={900}>
          {t("hosting.currentlyHosting.loading")}
        </Typography>
        <Typography variant="body2" color="var(--text-secondary)">
          {t("hosting.currentlyHosting.fetching")}
        </Typography>
      </Box>
    );
  }

  if (!hosting || hosting.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 52, color: "var(--text-secondary)" }} />
        <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>
          {t("hosting.currentlyHosting.noBookings")}
        </Typography>
        <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
          {t("hosting.currentlyHosting.noBookingsDesc")}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {hosting.map((stay) => {
        const listing = stay?.listingId;
        const guest = stay?.userSpecificData;

        return (
          <Paper
            key={stay?._id || stay?.id}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              backgroundColor: "white",
              transition: "0.2s ease",
              "&:hover": {
                boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Grid container>
              {/* Left: Listing Image */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 220, md: "100%" },
                    minHeight: { md: 220 },
                    backgroundColor: "rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={listing?.photos?.[0]}
                    alt={listing?.title || "Listing"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                  />

                  <Chip
                    label={t("hosting.currentlyHosting.staying")}
                    sx={{
                      position: "absolute",
                      top: 12,
                      [isRTL ? "right" : "left"]: 12,
                      borderRadius: 999,
                      fontWeight: 900,
                      backgroundColor: "rgba(46,125,50,0.90)",
                      color: "white",
                    }}
                  />
                </Box>
              </Grid>

              {/* Right: Content */}
              <Grid item xs={12} md={8}>
                <RTLWrapper sx={{ p: { xs: 2, md: 2.5 } }}>
                  {/* Header */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        {listing?.title || t("hosting.pending.request")}
                      </Typography>

                      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.4 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: "var(--text-secondary)" }} />
                        <Typography variant="body2" color="var(--text-secondary)">
                          {listing?.city || "Unknown city"}
                        </Typography>
                      </Stack>
                    </Box>

                    <Chip
                      icon={<PaymentsIcon />}
                      label={`Rs ${stay?.totalPrice || 0}`}
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 900,
                        px: 1,
                      }}
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Guest + Dates */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "rgba(0,0,0,0.015)",
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={guest?.photoProfile}
                            alt={guest?.name || "Guest"}
                            sx={{ width: 52, height: 52 }}
                          >
                            <PersonIcon />
                          </Avatar>

                          <Box>
                            <Typography fontWeight={900}>
                              {guest?.name || "Guest"}
                            </Typography>
                            <Typography variant="body2" color="var(--text-secondary)">
                              {t("guests")}: {stay?.guestCapacity || 0}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack spacing={0.6} sx={{ mt: 1.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PhoneIcon sx={{ fontSize: 16, color: "var(--text-secondary)" }} />
                            <Typography variant="body2" color="var(--text-secondary)">
                              {guest?.phoneNumber || "N/A"}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <EmailIcon sx={{ fontSize: 16, color: "var(--text-secondary)" }} />
                            <Typography variant="body2" color="var(--text-secondary)">
                              {guest?.email || "N/A"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "rgba(0,0,0,0.015)",
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarMonthIcon sx={{ color: "var(--text-secondary)" }} />
                          <Typography fontWeight={900}>{t("hosting.checkingOut.tripDates")}</Typography>
                        </Stack>

                        <Box sx={{ mt: 1.2 }}>
                          <Typography variant="body2" color="var(--text-secondary)">
                            {t("hosting.pending.checkIn")}:{" "}
                            <strong>
                              {stay?.startDate
                                ? new Date(stay.startDate).toLocaleDateString()
                                : "N/A"}
                            </strong>
                          </Typography>

                          <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
                            {t("hosting.pending.checkOut")}:{" "}
                            <strong>
                              {stay?.endDate
                                ? new Date(stay.endDate).toLocaleDateString()
                                : "N/A"}
                            </strong>
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </RTLWrapper>
              </Grid>
            </Grid>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default CurrentlyHosting;
