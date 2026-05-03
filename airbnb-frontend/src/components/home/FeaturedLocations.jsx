import React from "react";
import { Box, Typography, Container, Grid, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { pakistanCities, getCityName } from "../../constants/pakistanCities";

const locations = [
  {
    cityKey: "murree",
    stays: 120,
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4a/A_beautiful_view_of_Murree%2C_Pakistan.jpg?utm_source=en.wikivoyage.org&utm_campaign=index&utm_content=original",
  },
  {
    cityKey: "hunza",
    stays: 85,
    image: "https://hunzaadventuretours.com/wp-content/uploads/2022/04/Karimabad-Hunza-Valley.jpg",
  },
  {
    cityKey: "swat",
    stays: 90,
    image: "https://dreamvistatours.com/wp-content/uploads/2022/01/Swat-valley-beauty-1024x721.jpeg",
  },
  {
    cityKey: "karachi",
    stays: 200,
    image: "https://media.istockphoto.com/id/1127500841/photo/beautiful-view-of-bahadurabad-chorangi-karachi-pakistan.jpg?s=612x612&w=0&k=20&c=HzRA0Vbqa1zTSL88RNnUgebJZaZwDb6tZfmkXWwu89M=",
  },
];

const FeaturedLocations = () => {
  const { t } = useTranslation(["homepage", "translation"]);

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 8, md: 10 }, mb: 6 }}>
      <Box sx={{ mb: 5 }}>
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
          {t("homepage:featuredLocations")}
        </Typography>
        <Typography variant="body1" sx={{ color: "var(--text-secondary)", fontWeight: 500 }}>
          {t("homepage:featuredLocationsSubtitle")}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {locations.map((location, index) => {
          const cityObj = pakistanCities.find(c => c.cityKey === location.cityKey);
          const cityName = cityObj ? getCityName(cityObj, t) : location.cityKey;

          return (
            <Grid item xs={6} md={3} key={index}>
              <Box
                sx={{
                  position: "relative",
                  height: { xs: 240, md: 340 },
                  borderRadius: "24px",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  "&:hover": {
                    transform: "scale(1.02) translateY(-5px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    "& img": {
                      transform: "scale(1.1)",
                    },
                    "& .overlay-content": {
                      pb: 4,
                    }
                  },
                }}
              >
                <Box
                  component="img"
                  src={location.image}
                  alt={cityName}
                  loading="lazy"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.6s ease",
                  }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop";
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <Box className="overlay-content" sx={{ transition: "padding 0.3s ease" }}>
                    <Typography
                      variant="h5"
                      sx={{ color: "white", fontWeight: 900, fontSize: { xs: "1.2rem", md: "1.5rem" } }}
                    >
                      {cityName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, letterSpacing: "0.02em" }}
                    >
                      {t("homepage:staysCount", { count: location.stays })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default FeaturedLocations;
