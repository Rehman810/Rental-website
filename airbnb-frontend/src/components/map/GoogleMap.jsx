/**
 * GoogleMap.jsx — Primary map component for listing display (home page, room detail, etc.)
 *
 * Replaces the old Leaflet-based map.jsx with Google Maps via @react-google-maps/api.
 *
 * Features:
 *  - Renders Google Map with markers for each listing
 *  - InfoWindow on marker click (title + price)
 *  - Browser geolocation to re-center map
 *  - Bounds-change callback for "search as I move" 
 *  - Fully responsive (100% width, configurable height)
 *
 * Security:
 *  - API key loaded from VITE_GOOGLE_MAPS_API_KEY env variable
 *  - Restrict key in Google Cloud Console → API & Services → Credentials
 *    → Application restrictions → HTTP referrers (e.g. https://yourdomain.com/*)
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { CURRENCY } from "../../config/env";

// ─── Google Maps API key from environment ────────────────────────────────────
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// ─── Default map center: Karachi ─────────────────────────────────────────────
const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };
const DEFAULT_ZOOM = 12;

// ─── Responsive container style ──────────────────────────────────────────────
const containerStyle = {
  width: "100%",
  height: "100%",
};

// ─── Clean dark-ish map style for a premium feel ─────────────────────────────
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

const GoogleMapView = ({
  latitude,
  longitude,
  listings = [],
  onBoundsChange,
  searchAsMove,
  enableDraw = false, // Draw is not needed with Google Maps for now
  onDrawCreated,
  steps = false,
}) => {
  const [map, setMap] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapError, setMapError] = useState(null);

  // Ref to keep searchAsMove in sync without re-binding listeners
  const searchAsMoveRef = useRef(searchAsMove);
  useEffect(() => {
    searchAsMoveRef.current = searchAsMove;
  }, [searchAsMove]);

  // ─── Calculate map center ────────────────────────────────────────────────
  const center = {
    lat: latitude || userLocation?.lat || DEFAULT_CENTER.lat,
    lng: longitude || userLocation?.lng || DEFAULT_CENTER.lng,
  };

  // ─── Detect user location via browser geolocation ────────────────────────
  useEffect(() => {
    if (!latitude && !longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setUserLocation({ lat, lng });
          // Re-center map if already loaded
          if (map) {
            map.panTo({ lat, lng });
          }
        },
        () => {
          // Geolocation denied or unavailable — keep default center
          console.log("Geolocation denied, using default center (Karachi).");
        }
      );
    }
  }, [latitude, longitude, map]);

  // ─── Map load callback ───────────────────────────────────────────────────
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // ─── Handle idle (after pan/zoom) for "search as I move" ─────────────────
  const handleIdle = useCallback(() => {
    if (!map || !onBoundsChange || !searchAsMoveRef.current) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    onBoundsChange({
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng(),
    });
  }, [map, onBoundsChange]);

  // ─── Error states ────────────────────────────────────────────────────────
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <Box
        sx={{
          width: "100%",
          height: steps ? "400px" : "100%",
          minHeight: steps ? "400px" : "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          bgcolor: "var(--bg-secondary)",
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <Typography variant="body2" fontWeight={700}>
            Google Maps API key not configured.
          </Typography>
          <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
            Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your{" "}
            <code>.env</code> file.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: steps ? "400px" : "100%",
        minHeight: steps ? "400px" : "500px",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        zIndex: 0,
      }}
    >
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        loadingElement={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: "500px",
              bgcolor: "var(--bg-secondary)",
            }}
          >
            <CircularProgress sx={{ color: "#FF385C" }} />
          </Box>
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={DEFAULT_ZOOM}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onIdle={handleIdle}
          options={{
            styles: mapStyles,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* ─── Render markers for each listing ──────────────────────── */}
          {listings.map((item) => {
            // Extract coordinates: GeoJSON stores [lng, lat]
            let lat, lng;
            if (item.location && item.location.coordinates) {
              lng = item.location.coordinates[0];
              lat = item.location.coordinates[1];
            } else if (item.latitude && item.longitude) {
              lat = parseFloat(item.latitude);
              lng = parseFloat(item.longitude);
            }

            if (!lat || !lng) return null;

            return (
              <Marker
                key={item._id}
                position={{ lat, lng }}
                onClick={() => setSelectedListing(item)}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
              />
            );
          })}

          {/* ─── InfoWindow for selected listing ──────────────────────── */}
          {selectedListing && (() => {
            let lat, lng;
            if (selectedListing.location?.coordinates) {
              lng = selectedListing.location.coordinates[0];
              lat = selectedListing.location.coordinates[1];
            } else {
              lat = parseFloat(selectedListing.latitude);
              lng = parseFloat(selectedListing.longitude);
            }

            return (
              <InfoWindow
                position={{ lat, lng }}
                onCloseClick={() => setSelectedListing(null)}
              >
                <Box sx={{ minWidth: 160, p: 0.5 }}>
                  {/* Listing image thumbnail */}
                  {selectedListing.photos?.[0] && (
                    <Box
                      component="img"
                      src={selectedListing.photos[0]}
                      alt={selectedListing.title}
                      sx={{
                        width: "100%",
                        height: 100,
                        objectFit: "cover",
                        borderRadius: "8px",
                        mb: 1,
                      }}
                    />
                  )}
                  {/* Title */}
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "#222",
                    }}
                  >
                    {selectedListing.title}
                  </Typography>
                  {/* Price per night */}
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: "#FF385C" }}
                  >
                    {selectedListing.weekdayActualPrice || selectedListing.weekdayPrice || selectedListing.price}{" "}
                    {CURRENCY} / night
                  </Typography>
                </Box>
              </InfoWindow>
            );
          })()}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default GoogleMapView;
