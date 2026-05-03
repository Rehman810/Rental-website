import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/context";

const CheckInDetails = () => {
  const { t } = useTranslation("listingSteps");
  const {
    wifiPassword,
    setWifiPassword,
    checkInInstructions,
    setCheckInInstructions,
  } = useAppContext();

  return (
    <Box sx={{ width: "600px", margin: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t("checkIn.title")}
      </Typography>
      <Typography variant="body1" sx={{ color: "#757575", mb: 3 }}>
        {t("checkIn.subtitle")}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t("checkIn.wifi.label")}
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("checkIn.wifi.placeholder")}
          value={wifiPassword}
          onChange={(e) => setWifiPassword(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
      </Box>

      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t("checkIn.instructions.label")}
        </Typography>
        <Typography variant="body2" sx={{ color: "#757575", mb: 1 }}>
          {t("checkIn.instructions.subtitle")}
        </Typography>
        <TextField
          multiline
          rows={5}
          fullWidth
          variant="outlined"
          placeholder={t("checkIn.instructions.placeholder")}
          value={checkInInstructions}
          onChange={(e) => setCheckInInstructions(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default CheckInDetails;
