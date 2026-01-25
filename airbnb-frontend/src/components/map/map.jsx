import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Fix for default markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LeafletMap = ({
  latitude,
  longitude,
  listings = [],
  onBoundsChange,
  onDrawCreated,
  enableDraw = true,
  searchAsMove
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const searchAsMoveRef = useRef(searchAsMove);

  // Keep ref updated
  useEffect(() => {
    searchAsMoveRef.current = searchAsMove;
  }, [searchAsMove]);

  useEffect(() => {
    if (mapRef.current) return; // Initialize only once

    // Init Map
    const map = L.map("map").setView([latitude || 24.8607, longitude || 67.0011], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

    // Layers
    const markersLayer = L.layerGroup().addTo(map);
    markersRef.current = markersLayer;

    const drawnItems = new L.FeatureGroup().addTo(map);
    drawnItemsRef.current = drawnItems;

    mapRef.current = map;

    // Events
    map.on('moveend', () => {
      if (mapRef.current && onBoundsChange && searchAsMoveRef.current) {
        const bounds = mapRef.current.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    });

    // Draw Control
    if (enableDraw) {
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
          },
          rectangle: true,
          circle: false,
          marker: false,
          polyline: false,
          circlemarker: false
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      });
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        drawnItems.clearLayers(); // Only one shape at a time
        drawnItems.addLayer(layer);

        if (onDrawCreated) {
          // Get polygon coordinates
          if (layer.getLatLngs) {
            const latlngs = layer.getLatLngs();
            // Flatten if nested (Polygon can have holes, but simple draw usually [[lat,lng]...])
            const coords = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
            // Convert to array of [lat, lng]
            const simpleCoords = coords.map(c => [c.lat, c.lng]);
            onDrawCreated(simpleCoords);
          } else if (layer.getBounds) {
            // Rectangle
            const bounds = layer.getBounds();
            const box = [
              [bounds.getNorth(), bounds.getWest()], // Top-Left? No order matters for valid polygon usually, but let's do cyclic
              [bounds.getNorth(), bounds.getEast()],
              [bounds.getSouth(), bounds.getEast()],
              [bounds.getSouth(), bounds.getWest()]
            ];
            // Convert to [lat, lng] array
            onDrawCreated(box); // Just passing the array of points
          }
        }
      });

      map.on(L.Draw.Event.DELETED, () => {
        if (onDrawCreated) onDrawCreated(null);
      });
    }

    return () => {
      // Cleanup if needed, though react strict mode might double init
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!markersRef.current) return;

    markersRef.current.clearLayers();

    if (listings && listings.length > 0) {
      listings.forEach(item => {
        let lat, lng;
        if (item.location && item.location.coordinates) {
          // GeoJSON is [lng, lat]
          lng = item.location.coordinates[0];
          lat = item.location.coordinates[1];
        } else if (item.latitude && item.longitude) {
          lat = item.latitude;
          lng = item.longitude;
        }

        if (lat && lng) {
          const marker = L.marker([lat, lng])
            .bindPopup(`
                        <div style="min-width: 150px;">
                            <img src="${item.photos?.[0] || ''}" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:5px;" />
                            <h4 style="margin:0; font-size:14px;">${item.title}</h4>
                            <p style="margin:0; font-weight:bold;">${item.weekdayActualPrice} PKR</p>
                        </div>
                    `);
          markersRef.current.addLayer(marker);
        }
      });
    }

  }, [listings]);

  return <div id="map" style={{ width: "100%", height: "100%", minHeight: "500px", borderRadius: "12px", zIndex: 0 }} />;
};

export default LeafletMap;
