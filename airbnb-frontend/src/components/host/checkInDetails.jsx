import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useAppContext } from "../../context/context";

const CheckInDetails = () => {
  const {
    wifiPassword,
    setWifiPassword,
    checkInInstructions,
    setCheckInInstructions,
  } = useAppContext();

  return (
    <Box sx={{ width: "600px", margin: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Add check-in details
      </Typography>
      <Typography variant="body1" sx={{ color: "#757575", mb: 3 }}>
        Guests will receive this information one day before they check in.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          WiFi Password
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter WiFi password"
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
          Check-in Instructions & Pre-requisites
        </Typography>
        <Typography variant="body2" sx={{ color: "#757575", mb: 1 }}>
          Tell guests how to get in, any pre-requisites (like providing ID), or other necessary things.
        </Typography>
        <TextField
          multiline
          rows={5}
          fullWidth
          variant="outlined"
          placeholder="Example: The key is in the lockbox code 1234. Please bring a copy of your CNIC."
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
