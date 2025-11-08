import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Rectangle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-velocity";
console.log("velocityLayer", L.velocityLayer);
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SquareSelector from "./SquareSelector";
import NumberInput from "./NumberInput";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapSelectionApp() {
  const [box, setBox] = useState(null); // single selection
  const novaScotiaBounds = [
    [43.3, -66.4], // SW
    [47.1, -59.6], // NE
  ];

  const handleAddBox = (bounds) => {
    setBox({ id: 1, bounds }); // overwrite previous selection
  };

  const handleDeleteBox = () => {
    setBox(null);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" color="primary" sx={{ boxShadow: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            ༄ Windlytics: Go Where the Wind Blows
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Map Section */}
        <Box sx={{ flex: 3, position: "relative" }}>
          <MapContainer
            bounds={novaScotiaBounds}
            maxBounds={novaScotiaBounds}
            maxBoundsViscosity={1.0}
            minZoom={8}
            maxZoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <SquareSelector onSelect={handleAddBox} />

            {box && (
              <Rectangle
                bounds={box.bounds}
                pathOptions={{ color: "#1976d2", weight: 2, fillOpacity: 0.1 }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    handleDeleteBox();
                  },
                }}
              />
            )}
          </MapContainer>
        </Box>

        {/* Info Panel */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#fafafa",
            borderLeft: "1px solid #ddd",
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              mb: 2,
              background: "white",
              flexGrow: 1,
              overflowY: "auto",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Placement Generator
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {box ? (
                <>
                  <List dense>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={handleDeleteBox}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`Selected Area`}
                        secondary={
                          <>
                            SW: {box.bounds[0][0].toFixed(5)},{" "}
                            {box.bounds[0][1].toFixed(5)} <br />
                            NE: {box.bounds[1][0].toFixed(5)},{" "}
                            {box.bounds[1][1].toFixed(5)}
                          </>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <NumberInput />
                    </ListItem>
                  </List>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Click two points on the map to create a single square area.
                  Click the blue box or 🗑️ to delete it.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Button
            variant="contained"
            color="primary"
            disabled={!box}
            sx={{ borderRadius: 3, py: 1.2 }}
          >
            Confirm Selection
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
