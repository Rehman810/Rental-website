import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReviewsIcon from "@mui/icons-material/Reviews";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

const HostSection = ({ data, listing }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 5 }}>
      {/* Section Header */}
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Meet your Host
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Get to know who you’ll be staying with.
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        {/* Left Card */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              background:
                "linear-gradient(135deg, rgba(25,118,210,0.06), rgba(156,39,176,0.05))",
            }}
          >
            {/* Host Header */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={data?.photoProfile}
                alt="Host"
                sx={{
                  width: 76,
                  height: 76,
                  border: "3px solid rgba(25,118,210,0.25)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
                }}
              />

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
                    {data?.userName || "Host"}
                  </Typography>

                  <VerifiedIcon
                    color="primary"
                    sx={{ fontSize: "1.25rem" }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.6 }}>
                  <Chip
                    label="Superhost"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      bgcolor: "rgba(46,125,50,0.10)",
                      color: "success.main",
                    }}
                  />
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 18 }} />}
                    label="4.9"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2,
                      bgcolor: "rgba(255,193,7,0.18)",
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Stats Pills */}
            <Grid container spacing={1.2}>
              <Grid item xs={4}>
                <StatPill
                  icon={<ReviewsIcon sx={{ fontSize: 18 }} />}
                  value="227"
                  label="Reviews"
                />
              </Grid>
              <Grid item xs={4}>
                <StatPill
                  icon={<StarIcon sx={{ fontSize: 18 }} />}
                  value="4.9"
                  label="Rating"
                />
              </Grid>
              <Grid item xs={4}>
                <StatPill
                  icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                  value="9"
                  label="Years"
                />
              </Grid>
            </Grid>

            {/* Location */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <LocationOnIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Lives in <b>{listing?.city || "Pakistan"}</b>, Pakistan
              </Typography>
            </Stack>

            {/* Show more */}
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 1.5,
                px: 0,
                justifyContent: "flex-start",
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Show more
            </Button>
          </Paper>
        </Grid>

        {/* Right Content */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Stack spacing={2}>
              {/* Summary */}
              <Box>
                <Typography variant="subtitle1" fontWeight={900}>
                  {data?.userName || "Host"} is a Superhost
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Superhosts are experienced, highly rated hosts who are committed
                  to providing great stays for guests.
                </Typography>
              </Box>

              <Divider />

              {/* Host Details */}
              <Box>
                <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
                  Host details
                </Typography>

                <Stack spacing={1}>
                  <DetailRow
                    icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                    title="Response rate"
                    value="100%"
                  />
                  <DetailRow
                    icon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
                    title="Response time"
                    value="Responds within an hour"
                  />
                </Stack>
              </Box>

              {/* CTA */}
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "rgba(25,118,210,0.04)",
                  display: "flex",
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography fontWeight={900}>Have a question?</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Message the host before booking to confirm details.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={() =>
                    navigate(`/user/guestMessages/${listing?.hostId}`)
                  }
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.1,
                    fontWeight: 900,
                    boxShadow: "0 12px 30px rgba(25,118,210,0.25)",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 16px 35px rgba(25,118,210,0.35)",
                    },
                    transition: "all 0.18s ease",
                    minWidth: 190,
                  }}
                >
                  Message Host
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const StatPill = ({ icon, value, label }) => {
  return (
    <Box
      sx={{
        p: 1.2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255,255,255,0.55)",
        textAlign: "center",
      }}
    >
      <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center">
        <Box sx={{ color: "text.secondary" }}>{icon}</Box>
        <Typography fontWeight={900}>{value}</Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
};

const DetailRow = ({ icon, title, value }) => {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          backgroundColor: "rgba(25,118,210,0.10)",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="body2" fontWeight={900}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

export default HostSection;
