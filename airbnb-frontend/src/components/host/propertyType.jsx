import React, { useState } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAppContext } from "../../context/context";

const StyledPaper = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  border: selected
    ? `2px solid ${theme.palette.text.primary}`
    : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected
    ? theme.palette.action.selected
    : theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: "all 0.25s ease",
  borderRadius: "10px",

  "&:hover": {
    border: `2px solid ${theme.palette.text.primary}`,
  },
}));

const PropertyType = ({ type = [], heading, isAmenties }) => {
  const { amenties, setAmenties, propertyType, setPropertyType } = useAppContext();

  const select = (name) => {
    if (isAmenties) {
      setAmenties((prevSelected) =>
        prevSelected.includes(name)
          ? prevSelected.filter((item) => item !== name)
          : [...prevSelected, name]
      );
    } else {
      setPropertyType(name);
    }
  };

  return (
    <Box sx={{ py: 5, px: 3, paddingTop: "150px" }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
      >
        {heading}
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {type.map((property) => (
          <Grid item xs={12} sm={4} key={property.name}>
            {console.log(property.name)}
            <StyledPaper
              selected={
                isAmenties
                  ? amenties.includes(property.name)
                  : propertyType === property.name
              }
              onClick={() => select(property.name)}
              elevation={
                isAmenties
                  ? amenties.includes(property.name)
                    ? 6
                    : 2
                  : propertyType === property.name
                    ? 6
                    : 2
              }
            >
              {property.icon}
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ marginTop: 1 }}
              >
                {property.name}
              </Typography>
            </StyledPaper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PropertyType;
