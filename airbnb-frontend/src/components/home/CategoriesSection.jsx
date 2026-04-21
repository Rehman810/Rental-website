import React from "react";
import { Box, Typography, Container, Grid, Paper, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import CastleIcon from "@mui/icons-material/Castle";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import TerrainIcon from "@mui/icons-material/Terrain";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

const categories = [
  { label: "Haveli", icon: <CastleIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
  // { label: "Farmhouse", icon: <AgricultureIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
  { label: "Hill Retreat", icon: <TerrainIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
  { label: "Beach Villa", icon: <BeachAccessIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
  { label: "Mountain Cottage", icon: <HomeWorkIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
];

const CategoriesSection = () => {
  const { t } = useTranslation();

  const categories = [
    { key: "haveli", icon: <CastleIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
    { key: "hillRetreat", icon: <TerrainIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
    { key: "beachVilla", icon: <BeachAccessIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
    { key: "mountainCottage", icon: <HomeWorkIcon sx={{ fontSize: 32 }} />, color: "#BA7517" },
  ];

  return (
    <Container maxWidth="xl" sx={{ my: { xs: 6, md: 10 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.75rem", md: "2.5rem" },
            color: "var(--text-primary, #222)",
            letterSpacing: "-0.02em",
            mb: 1
          }}
        >
          {t("homepage:exploreByType")}
        </Typography>
        <Typography variant="body1" sx={{ color: "var(--text-secondary)", fontWeight: 500 }}>
          {t("homepage:exploreSubtitle")}
        </Typography>
      </Box>

      <Grid container spacing={2.5} justifyContent="center">
        {categories.map((cat, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Paper
              elevation={0}
              onClick={() => console.log(`Clicked ${cat.key}`)}
              sx={{
                p: { xs: 3, md: 4 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: "28px",
                cursor: "pointer",
                bgcolor: "var(--bg-card, #fff)",
                border: "1.5px solid",
                borderColor: "var(--border-light, #eee)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  boxShadow: "0 20px 40px rgba(186, 117, 23, 0.12)",
                  borderColor: cat.color,
                  transform: "translateY(-10px)",
                  "& .icon-box": {
                    bgcolor: "rgba(186, 117, 23, 0.15)",
                    color: cat.color,
                    transform: "rotate(10deg) scale(1.1)",
                  },
                  "& .cat-label": {
                    color: cat.color,
                  }
                },
              }}
            >
              <Box
                className="icon-box"
                sx={{
                  mb: 2.5,
                  p: 2,
                  borderRadius: "20px",
                  bgcolor: "var(--bg-secondary, #f8f8f8)",
                  color: "var(--text-primary, #555)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cat.icon}
              </Box>
              <Typography
                className="cat-label"
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "var(--text-primary, #444)",
                  transition: "color 0.3s ease",
                  fontSize: "1.1rem"
                }}
              >
                {t(`homepage:categories.${cat.key}`)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CategoriesSection;
