import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Rectangle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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
import townsData from "../data/nova_scotia_towns.json";

export default function MapSelectionApp() {
  const [box, setBox] = useState(null); // single selection
  const novaScotiaBounds = [
    [43.3, -66.4], // SW
    [47.1, -59.6], // NE
  ];
  const [towns, setTowns] = useState([]);
  const [adminRegion, setAdminRegion] = useState({ state: "", country: "" });
  const [showAllTowns, setShowAllTowns] = useState(false);

  useEffect(() => {
    if (!box) return;

    const [[latSW, lngSW], [latNE, lngNE]] = box.bounds;

    const nearbyTowns = townsData
      .filter(
        (t) =>
          t.lat >= latSW && t.lat <= latNE && t.lng >= lngSW && t.lng <= lngNE
      )
      .map((t) => t.name);

    console.log("Box bounds:", latSW, lngSW, latNE, lngNE);
    console.log("Nearby towns:", nearbyTowns);
    setTowns(nearbyTowns);
    setAdminRegion({ state: "Nova Scotia", country: "Canada" });
  }, [box]);

  // Compute approximate width, height, area
  const getAreaString = () => {
    if (!box) return "";
    const latSW = box.bounds[0][1];
    const latNE = box.bounds[1][1];
    const lngSW = box.bounds[0][0];
    const lngNE = box.bounds[1][0];

    const dLat = latNE - latSW;
    const dLng = lngNE - lngSW;
    const kmPerDegLat = 111;
    const kmPerDegLng = 111 * Math.cos((((latSW + latNE) / 2) * Math.PI) / 180);
    const heightKm = kmPerDegLat * dLat;
    const widthKm = kmPerDegLng * dLng;
    const areaKm2 = widthKm * heightKm;
    return `${areaKm2.toFixed(2)} km² (≈ ${widthKm.toFixed(
      2
    )} × ${heightKm.toFixed(2)} km)`;
  };

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
                    <ListItemText
                      primary={`Centroid`}
                      secondary={`${(
                        (box.bounds[0][1] + box.bounds[1][1]) /
                        2
                      ).toFixed(5)}, ${(
                        (box.bounds[0][0] + box.bounds[1][0]) /
                        2
                      ).toFixed(5)}`}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary={`Approximate Size`}
                      secondary={getAreaString()}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary={`Administrative Region`}
                      secondary={`${adminRegion.state}, ${adminRegion.country}`}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Nearby Towns / Cities"
                      secondary={
                        towns.length === 0 ? (
                          "None in selection"
                        ) : (
                          <>
                            {showAllTowns
                              ? towns.join(", ")
                              : towns.slice(0, 5).join(", ")}
                            {towns.length > 5 && (
                              <Button
                                size="small"
                                onClick={() => setShowAllTowns(!showAllTowns)}
                                sx={{ ml: 1, textTransform: "none" }}
                              >
                                {showAllTowns ? "Show less" : "Show more"}
                              </Button>
                            )}
                          </>
                        )
                      }
                    />
                  </ListItem>

                  <ListItem>
                    {/* Example of your NumberInput */}
                    <NumberInput />
                  </ListItem>
                </List>
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
