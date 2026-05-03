import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Divider, IconButton } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useAppContext } from "../../context/context";
import { useTranslation } from "react-i18next";

const CounterRow = ({ label, value, onDecrement, onIncrement }) => (
  <Grid
    container
    alignItems="center"
    justifyContent="space-between"
    sx={{ py: 2 }}
  >
    <Grid item>
      <Typography variant="body1" fontWeight="bold">
        {label}
      </Typography>
    </Grid>
    <Grid item>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <IconButton
          onClick={onDecrement}
          disabled={value <= 1}
          sx={{
            backgroundColor: "var(--background-color)",
            "&:hover": { backgroundColor: "var(--background-color)" },
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            width: "48px",
            height: "48px",
          }}
        >
          <RemoveIcon fontSize="medium" />
        </IconButton>

        <Typography variant="h5" sx={{ minWidth: "30px", textAlign: "center" }}>
          {value}
        </Typography>

        <IconButton
          onClick={onIncrement}
          sx={{
            backgroundColor: "var(--background-color)",
            "&:hover": { backgroundColor: "var(--background-color)" },
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            width: "48px",
            height: "48px",
          }}
        >
          <AddIcon fontSize="medium" />
        </IconButton>
      </Box>
    </Grid>
  </Grid>
);

const GuestCounter = () => {
  const { t } = useTranslation("listingSteps");
  const { guestCount, setGuestCount } = useAppContext();
  const [guests, setGuests] = useState(guestCount?.guests || 4);
  const [bedrooms, setBedrooms] = useState(guestCount?.bedrooms || 1);
  const [beds, setBeds] = useState(guestCount?.beds || 1);

  useEffect(() => {
    setGuestCount({ guests, bedrooms, beds });
  }, [guests, bedrooms, beds, setGuestCount]);

  return (
    <Box sx={{ p: 4, width: "600px", margin: "auto", backgroundColor: "var(--background-color)" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t("basics.title")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("basics.subtitle")}
      </Typography>

      <Divider />
      <CounterRow
        label={t("basics.guests")}
        value={guests}
        onDecrement={() => setGuests((prev) => Math.max(1, prev - 1))}
        onIncrement={() => setGuests((prev) => prev + 1)}
      />
      <Divider />
      <CounterRow
        label={t("basics.bedrooms")}
        value={bedrooms}
        onDecrement={() => setBedrooms((prev) => Math.max(1, prev - 1))}
        onIncrement={() => setBedrooms((prev) => prev + 1)}
      />
      <Divider />
      <CounterRow
        label={t("basics.beds")}
        value={beds}
        onDecrement={() => setBeds((prev) => Math.max(1, prev - 1))}
        onIncrement={() => setBeds((prev) => prev + 1)}
      />
      <Divider />
    </Box>
  );
};

export default GuestCounter;
