import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography, CircularProgress } from "@mui/material";
import { CURRENCY } from "../../config/env";

// ─── Fix Leaflet Default Icon Issue ──────────────────────────────────────────
// In Vite/Webpack, default icon paths often break. We define a custom one.
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ─── Component to handle map bounds and centering ────────────────────────────
const MapController = ({ center, listings }) => {
  const map = useMap();

  useEffect(() => {
    if (listings && listings.length > 0) {
      const points = listings
        .map((item) => {
          let lat, lng;
          if (item.location?.coordinates) {
            lng = parseFloat(item.location.coordinates[0]);
            lat = parseFloat(item.location.coordinates[1]);
          } else if (item.latitude && item.longitude) {
            lat = parseFloat(item.latitude);
            lng = parseFloat(item.longitude);
          }
          return (lat && lng && !isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;
        })
        .filter(Boolean);

      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (center) {
        map.setView(center, 12);
      }
    } else if (center) {
      map.setView(center, 12);
    }
  }, [listings, center, map]);

  return null;
};

const MapView = ({
  latitude,
  longitude,
  listings = [],
  onBoundsChange,
  searchAsMove,
  steps = false,
}) => {
  const defaultCenter = [24.8607, 67.0011]; // Karachi
  const center = useMemo(() => {
    if (latitude && longitude) return [parseFloat(latitude), parseFloat(longitude)];
    return defaultCenter;
  }, [latitude, longitude]);

  // Handle map movement for "Search as I move"
  const MapEvents = () => {
    const map = useMap();
    
    useEffect(() => {
      if (!searchAsMove || !onBoundsChange) return;

      const handleMoveEnd = () => {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorthEast().lat,
          south: bounds.getSouthWest().lat,
          east: bounds.getNorthEast().lng,
          west: bounds.getSouthWest().lng,
        });
      };

      map.on("moveend", handleMoveEnd);
      return () => map.off("moveend", handleMoveEnd);
    }, [map]);

    return null;
  };

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
        backgroundColor: "var(--bg-secondary)",
        "& .leaflet-container": {
          width: "100%",
          height: "100%",
        },
      }}
    >
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} listings={listings} />
        <MapEvents />

        {listings.map((item) => {
          let lat, lng;
          if (item.location?.coordinates) {
            lng = parseFloat(item.location.coordinates[0]);
            lat = parseFloat(item.location.coordinates[1]);
          } else if (item.latitude && item.longitude) {
            lat = parseFloat(item.latitude);
            lng = parseFloat(item.longitude);
          }

          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={item._id || `${lat}-${lng}-${Math.random()}`} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <Box sx={{ minWidth: 160, p: 0.5 }}>
                  {item.photos?.[0] && (
                    <Box
                      component="img"
                      src={item.photos[0]}
                      alt={item.title}
                      sx={{
                        width: "100%",
                        height: 100,
                        objectFit: "cover",
                        borderRadius: "8px",
                        mb: 1,
                      }}
                    />
                  )}
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#222" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: "#FF385C" }}>
                    {item.weekdayActualPrice || item.weekdayPrice || item.price}{" "}
                    {CURRENCY} / night
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default MapView;
