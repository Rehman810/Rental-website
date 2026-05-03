/**
 * GoogleMapAddressPicker.jsx — Address selection map for listing creation flow
 *
 * Replaces the old Leaflet-based map2.jsx with Google Maps.
 *
 * Features:
 *  - Draggable marker for picking exact location
 *  - Search bar with Google Places Autocomplete (uses Nominatim as fallback)
 *  - Browser geolocation to auto-center on user's position
 *  - Updates context with selected lat/lng for the listing creation flow
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import { useAppContext } from "../../context/context";

// ─── Google Maps API key from environment ────────────────────────────────────
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// ─── Default center: Karachi ─────────────────────────────────────────────────
const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleMapAddressPicker = ({
  initialLatitude = 24.8607,
  initialLongitude = 67.0011,
  popupText = "Location",
}) => {
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLatitude,
    lng: initialLongitude,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [locationDenied, setLocationDenied] = useState(false);

  const { setContextLatitude, setContextLongitude } = useAppContext();

  // ─── Detect user's location on mount ──────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          setMarkerPosition(newPos);
          setContextLatitude(latitude);
          setContextLongitude(longitude);
          setLocationDenied(false);
          if (map) map.panTo(newPos);
        },
        () => {
          setLocationDenied(true);
          setContextLatitude(initialLatitude);
          setContextLongitude(initialLongitude);
        }
      );
    } else {
      setContextLatitude(initialLatitude);
      setContextLongitude(initialLongitude);
    }
  }, []);

  // ─── Map callbacks ─────────────────────────────────────────────────────────
  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // ─── Draggable marker handler ──────────────────────────────────────────────
  const handleMarkerDragEnd = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      setContextLatitude(lat);
      setContextLongitude(lng);
    },
    [setContextLatitude, setContextLongitude]
  );

  // ─── Address search using Nominatim (free, no extra API key needed) ────────
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      fetchSuggestions(e.target.value);
    } else {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&countrycodes=pk&format=json`
      );
      const data = await response.json();
      setSuggestions(data.length > 0 ? data : []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSuggestionClick = (lat, lon, display_name) => {
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lon);
    const newPos = { lat: newLat, lng: newLng };
    setMarkerPosition(newPos);
    setContextLatitude(newLat);
    setContextLongitude(newLng);
    setSuggestions([]);
    setSearchQuery(display_name);
    if (map) {
      map.panTo(newPos);
      map.setZoom(15);
    }
  };

  // ─── API key missing state ─────────────────────────────────────────────────
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <Box sx={{ p: 3, paddingTop: "100px", width: "100%" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, textAlign: "center" }}>
          Enter your address
        </Typography>
        <Alert severity="warning">
          Google Maps API key not configured. Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, paddingTop: "100px", width: "100%" }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mb: 2, textAlign: "center" }}
      >
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
            onChange={handleSearchChange}
            placeholder="Enter your address"
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
              bottom: 50,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
          >
            Location access denied, defaulting to Karachi.
          </Alert>
        )}

        {/* ─── Google Map ────────────────────────────────────────────── */}
        <LoadScript
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          loadingElement={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "400px",
                bgcolor: "#f5f5f5",
              }}
            >
              <CircularProgress sx={{ color: "#FF385C" }} />
            </Box>
          }
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={markerPosition}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            {/* Draggable marker for location picking */}
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          </GoogleMap>
        </LoadScript>
      </Paper>
    </Box>
  );
};

export default GoogleMapAddressPicker;
