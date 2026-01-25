import React, { useMemo } from "react";
import { Grid, Typography, Box } from "@mui/material";

// Core Icons
import WifiIcon from "@mui/icons-material/Wifi";
import TvIcon from "@mui/icons-material/Tv";
import KitchenIcon from "@mui/icons-material/Kitchen";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PoolIcon from "@mui/icons-material/Pool";
import HotTubIcon from "@mui/icons-material/HotTub";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import BalconyIcon from "@mui/icons-material/Balcony";
import ElevatorIcon from "@mui/icons-material/Elevator";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SecurityIcon from "@mui/icons-material/Security";
import PetsIcon from "@mui/icons-material/Pets";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import WorkIcon from "@mui/icons-material/Work";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MicrowaveIcon from "@mui/icons-material/Microwave";
import CoffeeIcon from "@mui/icons-material/Coffee";
import BathtubIcon from "@mui/icons-material/Bathtub";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Amenities = ({ backendAmenities = [] }) => {
  // ✅ Expanded amenities list (same as your other UI)
  const amenities = useMemo(
    () => [
      { name: "Wifi", icon: <WifiIcon fontSize="large" /> },
      { name: "TV", icon: <TvIcon fontSize="large" /> },
      { name: "Kitchen", icon: <KitchenIcon fontSize="large" /> },
      { name: "Parking", icon: <LocalParkingIcon fontSize="large" /> },
      { name: "Air Conditioning", icon: <AcUnitIcon fontSize="large" /> },

      // FIX: Gym icon corrected ✅
      { name: "Gym", icon: <FitnessCenterIcon fontSize="large" /> },

      { name: "Pool", icon: <PoolIcon fontSize="large" /> },
      { name: "Hot Tub", icon: <HotTubIcon fontSize="large" /> },

      { name: "Washer", icon: <LocalLaundryServiceIcon fontSize="large" /> },
      { name: "Dryer", icon: <LocalLaundryServiceIcon fontSize="large" /> },

      { name: "Balcony", icon: <BalconyIcon fontSize="large" /> },
      { name: "Elevator", icon: <ElevatorIcon fontSize="large" /> },
      { name: "Heating", icon: <LocalFireDepartmentIcon fontSize="large" /> },

      { name: "Security", icon: <SecurityIcon fontSize="large" /> },
      { name: "CCTV", icon: <CameraAltIcon fontSize="large" /> },
      { name: "First Aid Kit", icon: <HealthAndSafetyIcon fontSize="large" /> },

      { name: "Pet Friendly", icon: <PetsIcon fontSize="large" /> },
      { name: "No Smoking", icon: <SmokeFreeIcon fontSize="large" /> },

      { name: "Workspace", icon: <WorkIcon fontSize="large" /> },
      { name: "Dining Area", icon: <RestaurantIcon fontSize="large" /> },

      { name: "Microwave", icon: <MicrowaveIcon fontSize="large" /> },
      { name: "Coffee Maker", icon: <CoffeeIcon fontSize="large" /> },
      { name: "Bathtub", icon: <BathtubIcon fontSize="large" /> },
    ],
    []
  );

  // ✅ Normalize backend list (case-insensitive safe)
  const normalizedBackend = useMemo(() => {
    return (backendAmenities || []).map((a) => String(a).trim().toLowerCase());
  }, [backendAmenities]);

  // ✅ Match known amenities
  const filteredAmenities = useMemo(() => {
    return amenities.filter((amenity) =>
      normalizedBackend.includes(amenity.name.toLowerCase())
    );
  }, [amenities, normalizedBackend]);

  // ✅ Show unknown backend amenities too (fallback icon)
  const unknownAmenities = useMemo(() => {
    const knownNames = amenities.map((a) => a.name.toLowerCase());

    return (backendAmenities || [])
      .filter((a) => !knownNames.includes(String(a).trim().toLowerCase()))
      .map((a) => ({
        name: a,
        icon: <CheckCircleIcon fontSize="large" />,
      }));
  }, [backendAmenities, amenities]);

  const finalAmenities = [...filteredAmenities, ...unknownAmenities];

  if (!finalAmenities.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        No amenities listed.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {finalAmenities.map((amenity, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            <Box sx={{ color: "primary.main" }}>{amenity.icon}</Box>
            <Typography sx={{ fontWeight: 800 }}>{amenity.name}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default Amenities;
