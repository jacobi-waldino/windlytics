import React, { useState } from "react";
import {
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function SquareSelector({ onSelect }) {
  const [firstCorner, setFirstCorner] = useState(null);
  const [tempMarker, setTempMarker] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const debounceDelay = 300; // ms

  const handleMapClick = (e) => {
    if (e.originalEvent.target.closest(".leaflet-interactive")) return;

    const now = Date.now();
    if (now - lastClickTime < debounceDelay) return;
    setLastClickTime(now);

    if (!firstCorner) {
      setFirstCorner(e.latlng);
      setTempMarker(e.latlng);
    } else {
      const bounds = [
        [
          Math.min(firstCorner.lat, e.latlng.lat),
          Math.min(firstCorner.lng, e.latlng.lng),
        ],
        [
          Math.max(firstCorner.lat, e.latlng.lat),
          Math.max(firstCorner.lng, e.latlng.lng),
        ],
      ];
      onSelect(bounds);
      setFirstCorner(null);
      setTempMarker(null);
    }
  };

  useMapEvents({
    click: handleMapClick,
  });

  const handleCancelMarker = (e) => {
    e.originalEvent.stopPropagation();
    setFirstCorner(null);
    setTempMarker(null);
  };

  return tempMarker ? (
    <Marker
      position={tempMarker}
      icon={markerIcon}
      eventHandlers={{
        click: handleCancelMarker,
      }}
    />
  ) : null;
}