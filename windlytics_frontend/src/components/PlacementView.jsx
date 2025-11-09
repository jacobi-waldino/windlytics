import React, { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMapEvents,
  Circle,
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
  Snackbar,
  Alert,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
  const [openModal, setOpenModal] = useState(false);
  const [showBanks, setShowBanks] = useState(true);

  // Default start/end dates
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [apiError, setApiError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

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
    if (!startDate || !endDate) return;
    if (endDate < startDate) {
      alert("End date cannot be before start date");
      return;
    }

    setLoading(true);
    setApiError(null);
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
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "API request failed");
        }

        const data = await response.json();
        updated.push({
          ...w,
          result: { ...data, ...model },
        });
      } catch (err) {
        console.error("Simulation error:", err);
        updated.push({ ...w, result: { error: err.message } });
        setSnackbar({
          open: true,
          message: `Simulation API error: ${err.message}`,
        });
      }
    }

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
        <Box sx={{ flex: 2, position: "relative" }}>
          <MapContainer
            bounds={novaScotiaBounds}
            maxBounds={novaScotiaBounds}
            maxBoundsViscosity={1.0}
            minZoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Sable Island Bank - Red Outline */}
            {showBanks && (
              <>
                <Circle
                  center={[43.8, -61.0]}
                  radius={40000}
                  pathOptions={{
                    color: "red",
                    weight: 3,
                    opacity: 0.8,
                    fill: false,
                  }}
                />
                {/* French Bank - Red Outline */}
                <Circle
                  center={[44.5, -60.5]}
                  radius={35000}
                  pathOptions={{
                    color: "red",
                    weight: 3,
                    opacity: 0.8,
                    fill: false,
                  }}
                />
                {/* French Bank Part 2 - Red Outline */}
                <Circle
                  center={[44.5, -61.5]}
                  radius={35000}
                  pathOptions={{
                    color: "red",
                    weight: 3,
                    opacity: 0.8,
                    fill: false,
                  }}
                />
                {/* Emerald Bank - Red Outline */}
                <Circle
                  center={[43.5, -62.2]}
                  radius={55000}
                  pathOptions={{
                    color: "red",
                    weight: 3,
                    opacity: 0.8,
                    fill: false,
                  }}
                />
                {/* Sydney Bight - Red Outline */}
                <Circle
                  center={[46.652568625714245, -59.5086061894759]}
                  radius={35000}
                  pathOptions={{
                    color: "red",
                    weight: 3,
                    opacity: 0.8,
                    fill: false,
                  }}
                />
              </>
            )}
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
          {/* Toggle Banks Button */}
          <Button
            onClick={() => setShowBanks(!showBanks)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 400,
              backgroundColor: "white",
              color: "primary.main",
              border: "1px solid #ddd",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            {showBanks ? "Hide Banks" : "Show Banks"}
          </Button>
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
              Wind Turbine Placement
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
            sx={{
              p: 2,
              borderTop: "1px solid #ddd",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </LocalizationProvider>

            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 3 }}
              onClick={runSimulation}
              disabled={
                loading ||
                windmills.length === 0 ||
                !windmills.every((w) => w.type !== "")
              }
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Run Simulation"
              )}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              sx={{ borderRadius: 3 }}
              onClick={() => setOpenModal(true)}
              disabled={
                !windmills.some((w) => w.result) ||
                windmills.some((w) => w.type === "")
              }
            >
              Reopen Simulation Results
            </Button>
          </Box>
        </Box>
      </Box>
      <SimulationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        windmills={windmills}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
