import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Alert,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import { useAppContext } from "../../context/context";

// ─── Fix Leaflet Default Icon Issue ──────────────────────────────────────────
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ─── Component to handle map centering ───────────────────────────────────────
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// ─── Draggable Marker Component ─────────────────────────────────────────────
const DraggableMarker = ({ position, onPositionChange }) => {
  const map = useMap();
  
  const eventHandlers = useCallback({
    dragend(e) {
      const marker = e.target;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onPositionChange(lat, lng);
      }
    },
  }, [onPositionChange]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={customIcon}
    />
  );
};

const AddressPicker = ({
  initialLatitude = 24.8607,
  initialLongitude = 67.0011,
}) => {
  const [position, setPosition] = useState([initialLatitude, initialLongitude]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [locationDenied, setLocationDenied] = useState(false);

  const { setContextLatitude, setContextLongitude } = useAppContext();

  // ─── Detect user's location on mount ──────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setContextLatitude(latitude);
          setContextLongitude(longitude);
          setLocationDenied(false);
        },
        () => {
          setLocationDenied(true);
          setContextLatitude(initialLatitude);
          setContextLongitude(initialLongitude);
        }
      );
    }
  }, []);

  const handlePositionChange = (lat, lng) => {
    setPosition([lat, lng]);
    setContextLatitude(lat);
    setContextLongitude(lng);
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 3) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&countrycodes=pk&format=json`
      );
      const data = await response.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSuggestionClick = (lat, lon, display_name) => {
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lon);
    setPosition([newLat, newLng]);
    setContextLatitude(newLat);
    setContextLongitude(newLng);
    setSuggestions([]);
    setSearchQuery(display_name);
  };

  return (
    <Box sx={{ p: 3, paddingTop: "100px", width: "100%" }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, textAlign: "center" }}>
        Enter your address
      </Typography>

      <Paper
        sx={{
          height: "400px",
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* ─── Search overlay ───────────────────────────────────────────── */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "90%",
            maxWidth: "600px",
          }}
        >
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            placeholder="Search for an address..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => fetchSuggestions(searchQuery)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "white",
                borderRadius: "50px",
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
              },
            }}
          />

          {/* ─── Suggestions dropdown ─────────────────────────────────── */}
          {suggestions.length > 0 && (
            <List
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
                maxHeight: "200px",
                overflowY: "auto",
                borderRadius: "0 0 12px 12px",
                mt: 1,
              }}
            >
              {suggestions.map((suggestion, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() =>
                      handleSuggestionClick(
                        suggestion.lat,
                        suggestion.lon,
                        suggestion.display_name
                      )
                    }
                  >
                    <ListItemText primary={suggestion.display_name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* ─── Location denied alert ─────────────────────────────────── */}
        {locationDenied && (
          <Alert
            severity="warning"
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
          >
            Location access denied, defaulting to Karachi.
          </Alert>
        )}

        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={position} />
          <DraggableMarker position={position} onPositionChange={handlePositionChange} />
        </MapContainer>
      </Paper>
    </Box>
  );
};

export default AddressPicker;
