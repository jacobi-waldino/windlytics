import React, { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Card,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Select,
  Divider,
  CircularProgress,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import windmillSVG from "../assets/windmill.svg";
import SimulationModal from "./SimulationModal";

const windmillIcon = new L.Icon({
  iconUrl: windmillSVG,
  iconRetinaUrl: windmillSVG,
  iconSize: [32, 32],
  iconAnchor: [16, 24],
  popupAnchor: [0, -32],
  shadowUrl: null,
});

const windmillDict = {
  "SWT-7.0-154": {
    company: "Siemens Gamesa Renewable Energy",
    message: "Model with most units operational at sea",
    cut_in: 3.0,
    rated: 13.0,
    cut_out: 25.0,
    rated_power: 7000.0,
    rotor_diameter: 154,
    tip_height: 180,
  },
  "GE Haliade-X 13 MW": {
    company: "GE Renewable Energy",
    message:
      "Largest order to date – 277 units with a power output of 13 and 14 MW",
    cut_in: 3.0,
    rated: 11.0,
    cut_out: 34.0,
    rated_power: 13000.0,
    rotor_diameter: 220,
    tip_height: 260,
  },
  "GE Haliade-X 14 MW": {
    company: "GE Renewable Energy",
    message:
      "Largest order to date – 277 units with a power output of 13 and 14 MW",
    cut_in: 3.0,
    rated: 11.0,
    cut_out: 34.0,
    rated_power: 14000.0,
    rotor_diameter: 220,
    tip_height: 260,
  },
  "SG 14-222 DD": {
    company: "Siemens Gamesa Renewable Energy",
    message: "Largest turbine ordered",
    cut_in: 3.0,
    rated: 12.0,
    cut_out: 32.0,
    rated_power: 14000.0,
    rotor_diameter: 222,
    tip_height: 260,
  },
};

// debounce helper
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function MapSelectionApp() {
  const novaScotiaBounds = [
    [43.3, -66.4],
    [47.1, -59.6],
  ];

  const [windmills, setWindmills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulationDays, setSimulationDays] = useState(7);
  const [openModal, setOpenModal] = useState(false);

  const handleMapClick = useCallback(
    debounce((e) => {
      const existing = windmills.find(
        (w) =>
          Math.abs(w.lat - e.latlng.lat) < 0.0001 &&
          Math.abs(w.lng - e.latlng.lng) < 0.0001
      );

      if (existing) {
        setWindmills((prev) => prev.filter((w) => w !== existing));
      } else {
        setWindmills((prev) => [
          ...prev,
          {
            id: Date.now(),
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            type: "",
            result: null,
          },
        ]);
      }
    }, 200),
    [windmills]
  );

  function MapClickHandler() {
    useMapEvents({ click: handleMapClick });
    return null;
  }

  const updateType = (id, type) =>
    setWindmills((prev) => prev.map((w) => (w.id === id ? { ...w, type } : w)));

  const removeWindmill = (id) =>
    setWindmills((prev) => prev.filter((w) => w.id !== id));

  // 🧮 Run simulation for all turbines
  const runSimulation = async () => {
    setLoading(true);
    const updated = [];

    for (const w of windmills) {
      const model = windmillDict[w.type];
      if (!model) continue;

      try {
        const response = await fetch("http://127.0.0.1:5000/generated-energy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cut_in: model.cut_in,
            rated: model.rated,
            cut_out: model.cut_out,
            rated_power: model.rated_power,
            latitude: w.lat,
            longitude: w.lng,
            days: simulationDays,
          }),
        });

        const data = await response.json();
        updated.push({
          ...w,
          result: {
            ...data,
            ...model,
          },
        });
      } catch (err) {
        console.error("Simulation error:", err);
        updated.push({ ...w, result: { error: "Failed to fetch data" } });
      }
    }

    console.log(updated);
    setWindmills(updated);
    setLoading(false);

    if (updated.length > 0) setOpenModal(true);
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

      <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
        {/* Map */}
        <Box sx={{ flex: 2 }}>
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
            <MapClickHandler />

            {windmills.map((w, i) => (
              <Marker
                key={w.id}
                position={[w.lat, w.lng]}
                icon={windmillIcon}
                eventHandlers={{ click: () => removeWindmill(w.id) }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  permanent
                  opacity={0.9}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1976d2",
                      textShadow: "0 1px 2px white",
                    }}
                  >
                    {i + 1}
                  </Typography>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </Box>

        {/* Sidebar */}
        <Box
          sx={{
            flex: 1.2,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fafafa",
            borderLeft: "1px solid #ddd",
          }}
        >
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
            >
              Windmill Placement
            </Typography>

            {windmills.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Click anywhere on the map to place a windmill.
              </Typography>
            )}

            <List>
              {windmills.map((w, i) => {
                const details = windmillDict[w.type];
                return (
                  <Card
                    key={w.id}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      background: "white",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      p: 1,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => removeWindmill(w.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={`Turbine #${i + 1}: (${w.lat.toFixed(
                            3
                          )}, ${w.lng.toFixed(3)})`}
                        />
                        <Select
                          value={w.type}
                          onChange={(e) => updateType(w.id, e.target.value)}
                          displayEmpty
                          size="small"
                          sx={{ minWidth: 200 }}
                        >
                          <MenuItem value="">
                            <em>Select Model</em>
                          </MenuItem>
                          {Object.keys(windmillDict).map((key) => (
                            <MenuItem key={key} value={key}>
                              {key}
                            </MenuItem>
                          ))}
                        </Select>
                      </ListItem>

                      {details && (
                        <>
                          <Divider />
                          <Box sx={{ p: 2 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, mb: 0.5 }}
                            >
                              {details.company}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {details.message}
                            </Typography>

                            <Box sx={{ fontSize: 14 }}>
                              <Typography variant="body2">
                                <strong>Rated Power:</strong>{" "}
                                {details.rated_power.toLocaleString()} kW
                              </Typography>
                              <Typography variant="body2">
                                <strong>Rotor Diameter:</strong>{" "}
                                {details.rotor_diameter} m
                              </Typography>
                              <Typography variant="body2">
                                <strong>Tip Height:</strong>{" "}
                                {details.tip_height} m
                              </Typography>
                              <Typography variant="body2">
                                <strong>Cut-in Speed:</strong> {details.cut_in}{" "}
                                m/s
                              </Typography>
                              <Typography variant="body2">
                                <strong>Rated Speed:</strong> {details.rated}{" "}
                                m/s
                              </Typography>
                              <Typography variant="body2">
                                <strong>Cut-out Speed:</strong>{" "}
                                {details.cut_out} m/s
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Card>
                );
              })}
            </List>
          </Box>

          <Box
            sx={{ p: 2, borderTop: "1px solid #ddd", display: "flex", gap: 2 }}
          >
            <TextField
              type="number"
              label="Days"
              value={simulationDays}
              onChange={(e) =>
                setSimulationDays(Math.max(1, Number(e.target.value)))
              }
              size="small"
              sx={{ width: 100, "& input": { textAlign: "center" } }}
              inputProps={{ min: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 3, flexGrow: 1 }}
              onClick={runSimulation}
              disabled={loading || windmills.length === 0}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Run Simulation"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
      <SimulationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        windmills={windmills}
      />
    </Box>
  );
}
