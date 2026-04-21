import React from "react";
import { Box, Grid, Typography, Container } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const badges = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 32 }} />,
    title: "Verified Hosts",
    description: "CNIC verified property owners",
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    title: "Secure Payments",
    description: "Safe & protected transactions",
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 32 }} />,
    title: "24/7 Support",
    description: "Always here to help you",
  },
];

const TrustBadges = () => {
  return (
    <Box
      sx={{
        bgcolor: "var(--bg-secondary, #F5F0E8)",
        py: { xs: 6, md: 8 },
        width: "100%",
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "var(--border-light, #eee)",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center" textAlign="center">
          {badges.map((badge, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 70,
                    height: 70,
                    borderRadius: "24px",
                    bgcolor: "var(--bg-primary, #fff)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    color: "#0F6E56",
                    transition: "inherit",
                  }}
                >
                  {badge.icon}
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  sx={{ 
                    color: "var(--text-primary, #333)", 
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                    letterSpacing: "-0.01em",
                    mb: 0.5
                  }}
                >
                  {badge.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: "var(--text-secondary, #666)", 
                    maxWidth: 220, 
                    mx: "auto",
                    lineHeight: 1.6,
                    fontWeight: 500
                  }}
                >
                  {badge.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TrustBadges;
