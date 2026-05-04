import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAppContext } from "../../context/context";
import MapView from "../map/MapView";
import { useTranslation } from "react-i18next";

const AddressForm = () => {
  const { t } = useTranslation("listingSteps");
  const [showLocation, setShowLocation] = useState(true);
  const [country, setCountry] = useState("Pakistan - PK");
  const { setAddress, contextLatitude, contextLongitude } = useAppContext();
  const [selectedCity, setSelectedCity] = useState("Karachi");

  const cities = [
    { name: "Karachi", label: "Karachi" },
    { name: "Islamabad", label: "Islamabad" },
    { name: "Lahore", label: "Lahore" },
  ];

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    handleFieldChange("city", event.target.value)
  };

  const [addressData, setAddressData] = React.useState({
    country: "Pakistan - PK",
    streetAddress: "",
    flat: "",
    city: "Karachi",
    area: "Sindh",
    postcode: "",
  });

  const handleFieldChange = (field, value) => {
    const updatedData = { ...addressData, [field]: value };
    setAddressData(updatedData);
    setAddress(updatedData);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, margin: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {t("address.title")}
      </Typography>
      <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 2 }}>
        {t("address.desc")}
      </Typography>

      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          select
          label={t("address.country")}
          value={country}
          onChange={(e) => handleFieldChange("country", e.target.value)}
          variant="outlined"
        >
          <MenuItem value="Pakistan - PK">Pakistan - PK</MenuItem>
          {/* <MenuItem value="India - IN">India - IN</MenuItem>
          <MenuItem value="USA - US">USA - US</MenuItem> */}
        </TextField>
        <TextField
          label={t("address.street")}
          variant="outlined"
          onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
        />
        <TextField
          label={t("address.flat")}
          variant="outlined"
          onChange={(e) => handleFieldChange("flat", e.target.value)}
        />
        {/* <TextField
          label="City/town/village"
          defaultValue="Karachi"
          variant="outlined"
          onChange={(e) => handleFieldChange("city", e.target.value)}
        /> */}

        <FormControl fullWidth variant="outlined">
          <InputLabel>{t("address.city")}</InputLabel>
          <Select
            value={selectedCity}
            onChange={handleCityChange}
            label="City/town/village"
          >
            {cities.map((city) => (
              <MenuItem key={city.name} value={city.name}>
                {t(`address.cities.${city.name}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label={t("address.area")}
          defaultValue="Sindh"
          variant="outlined"
          onChange={(e) => handleFieldChange("area", e.target.value)}
        />
        <TextField
          label={t("address.postcode")}
          variant="outlined"
          onChange={(e) => handleFieldChange("postcode", e.target.value)}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={showLocation}
            onChange={() => setShowLocation(!showLocation)}
          />
        }
        label={
          <Typography variant="body2" fontWeight="bold">
            {t("address.showLocation")}
          </Typography>
        }
        sx={{ mt: 3 }}
      />
      <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
        {t("address.showLocationDesc")}
        <Typography component="span" color="primary" sx={{ cursor: "pointer" }}>
          {" "}
          {t("address.learnMore")}
        </Typography>
      </Typography>

      <MapView
        steps={true}
        latitude={contextLatitude || 30.3753}
        longitude={contextLongitude || 69.3451}
      />
    </Box>
  );
};

export default AddressForm;
