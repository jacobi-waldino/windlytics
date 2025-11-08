import React, { useEffect } from "react";
import {
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-velocity";
console.log("velocityLayer", L.velocityLayer);

export default function WindLayer ({ data, options }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    map.whenReady(() => {
      const velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "Wind",
          position: "bottomleft",
          emptyString: "No wind data",
          angleConvention: "bearingCW",
        },
        data: data, // pass the full object with header + u/v
        minVelocity: options?.minVelocity ?? 0,
        maxVelocity: options?.maxVelocity ?? 20,
        velocityScale: options?.velocityScale ?? 0.005,
      });

      velocityLayer.addTo(map);

      return () => {
        map.removeLayer(velocityLayer);
      };
    });
  }, [map, data, options]);

  return null;
};
