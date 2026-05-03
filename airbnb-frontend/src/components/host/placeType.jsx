import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import HouseIcon from "@mui/icons-material/House";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BarnIcon from "@mui/icons-material/StoreMallDirectory";
import { useAppContext } from "../../context/context";
import { useTranslation } from "react-i18next";

const StyledPaper = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  cursor: "pointer",

  border: selected
    ? `1.5px solid ${theme.palette.text.primary}`
    : `1px solid ${theme.palette.divider}`,

  backgroundColor: selected
    ? theme.palette.action.selected
    : theme.palette.background.paper,

  transition: "all 0.3s ease",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: "10px",
  width: "100%",
  maxWidth: "500px",
  margin: "0 auto",

  "&:hover": {
    border: `1.5px solid ${theme.palette.text.primary}`,
  },
}));

const propertyTypes = [
  { name: "Entire Place", text: "Guests have the whole place to themselves", icon: <HouseIcon fontSize="large" /> },
  { name: "A Room", text: "Guests have the whole place to themselves", icon: <ApartmentIcon fontSize="large" /> },
  { name: "A Shared Room", text: "Guests have the whole place to themselves", icon: <BarnIcon fontSize="large" /> },
];

const PlaceType = () => {
  const { t } = useTranslation("listingSteps");
  const { placeType, setPlaceType } = useAppContext();

  const select = (type) => {
    setPlaceType(type);
  };

  return (
    <Box sx={{ py: 5, px: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
        {t("placeType.heading")}
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {propertyTypes.map((property) => (
          <Grid item xs={12} sm={12} md={8} key={property.name}>
            <StyledPaper
              selected={placeType === property.name}
              onClick={() => select(property.name)}
              elevation={placeType === property.name ? 6 : 1}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {t(`placeType.types.${property.name}.title`)}
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)">
                  {t(`placeType.types.${property.name}.desc`)}
                </Typography>
              </Box>
              <Box>{property.icon}</Box>
            </StyledPaper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlaceType;
