import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// Color-blind safe palette
const colors = ["#0072B2", "#E69F00", "#009E73", "#CC79A7", "#F0E442"];
const strokePatterns = ["solid", "5 5", "2 2", "8 4 2 4", "solid"];

const PRICE_PER_MWH = 50; // $/MWh

export default function SimulationModal({ open, onClose, windmills }) {
  const [activeTab, setActiveTab] = useState(0);
  const [comparison, setComparison] = useState(false);

  const handleTabChange = (e, newValue) => setActiveTab(newValue);

  const getSummary = (w) => {
    if (!w?.result?.daily_energies) return null;
    const totalEnergy =
      w.result.total_energy_MWh ||
      w.result.daily_energies.reduce(
        (sum, d) => sum + (d.daily_total_energy_MWh || 0),
        0
      );
    const revenue = (totalEnergy * PRICE_PER_MWH).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return { totalEnergy, revenue };
  };

  const getAggregateSummary = () => {
    const totalEnergy = windmills.reduce(
      (sum, w) => sum + (w.result?.total_energy_MWh || 0),
      0
    );
    const revenue = (totalEnergy * PRICE_PER_MWH).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return { totalEnergy, revenue };
  };

  const getHourlyData = (w) => {
    if (!w?.result?.daily_energies) return [];
    return w.result.daily_energies.flatMap((day) =>
      day.hourly_energies.map((h) => ({
        datetime: `${day.date} ${h.hour}`,
        energy_MWh: h.hourly_energy_MWh,
        wind_speed: h.predicted_wind_speed_m_s,
      }))
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">
          <b>Results</b>
        </Typography>

        <Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setComparison((prev) => !prev)}
            sx={{ mr: 1 }}
          >
            {comparison ? "Individual View" : "Comparison View"}
          </Button>
          <IconButton onClick={onClose} aria-label="Close Results">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {!comparison ? (
          <>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ style: { backgroundColor: "#1976d2" } }}
              aria-label="Select turbine to view results"
              sx={{ mb: 1 }}
            >
              {windmills.map((w, i) => (
                <Tab
                  key={w.id}
                  label={`Turbine #${i + 1}`}
                  id={`turbine-tab-${i}`}
                  aria-controls={`turbine-tabpanel-${i}`}
                />
              ))}
            </Tabs>

            {windmills[activeTab] &&
              windmills[activeTab].result &&
              (() => {
                const summary = getSummary(windmills[activeTab]);
                if (!summary) return null;
                return (
                  <Box
                    sx={{
                      mb: 1,
                      p: 1,
                      backgroundColor: "#e3f2fd",
                      borderRadius: 1,
                    }}
                    aria-label={`Summary for Turbine #${activeTab + 1}`}
                  >
                    <Typography variant="h6">
                      <b>Energy Generated:</b>{" "}
                      {summary.totalEnergy.toLocaleString()} MWh
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      <i>Aggregate (all turbines): </i>
                      {getAggregateSummary().totalEnergy.toLocaleString()} MWh
                    </Typography>
                    <Typography variant="h6">
                      <b>Potential Revenue:</b> ${summary.revenue}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      <i>Aggregate (all turbines):</i> $
                      {getAggregateSummary().revenue}
                    </Typography>
                  </Box>
                );
              })()}

            <Tooltip
              title={
                <Typography sx={{ fontSize: 16 }}>
                  <b>Cut-in Wind Speed:</b> Minimum speed to start generating
                  power.
                  <br />
                  <b>Rated Wind Speed:</b> Speed at max power.
                  <br />
                  <b>Cut-out Wind Speed:</b> Speed above which turbine stops.
                </Typography>
              }
              placement="top"
              arrow
            >
              <IconButton size="small" aria-label="Wind speed definitions">
                <InfoOutlinedIcon fontSize="medium" />
              </IconButton>
            </Tooltip>

            {windmills[activeTab] && windmills[activeTab].result ? (
              <ResponsiveContainer
                width="100%"
                height={400}
                aria-label={`Hourly energy and wind speed chart for Turbine #${
                  activeTab + 1
                }`}
              >
                <LineChart data={getHourlyData(windmills[activeTab])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="datetime" tick={{ fontSize: 10 }} />
                  <YAxis
                    yAxisId="left"
                    label={{
                      value: "Energy (MWh)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Wind Speed (m/s)",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="energy_MWh"
                    stroke="#1976d2"
                    name="Energy (MWh)"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="wind_speed"
                    stroke="#ff6d00"
                    strokeDasharray="5 5"
                    name="Wind Speed (m/s)"
                    dot={false}
                  />
                  <ReferenceLine
                    y={windmills[activeTab].result.cut_in}
                    yAxisId="right"
                    stroke="red"
                    strokeDasharray="3 3"
                    label="Cut-in"
                  />
                  <ReferenceLine
                    y={windmills[activeTab].result.rated}
                    yAxisId="right"
                    stroke="green"
                    strokeDasharray="3 3"
                    label="Rated"
                  />
                  <ReferenceLine
                    y={windmills[activeTab].result.cut_out}
                    yAxisId="right"
                    stroke="red"
                    strokeDasharray="3 3"
                    label="Cut-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No simulation data available.</Typography>
            )}

            {/* Metadata */}
            <Box
              sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
            >
              {windmills[activeTab] && (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {windmills[activeTab].type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {windmills[activeTab].result?.message || ""}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rated Power:</strong>{" "}
                    {windmills[activeTab].result?.rated_power?.toLocaleString()}{" "}
                    kW
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rotor Diameter:</strong>{" "}
                    {windmills[activeTab].result?.rotor_diameter} m
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tip Height:</strong>{" "}
                    {windmills[activeTab].result?.tip_height} m
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cut-in Speed:</strong>{" "}
                    {windmills[activeTab].result?.cut_in} m/s |{" "}
                    <strong>Rated Speed:</strong>{" "}
                    {windmills[activeTab].result?.rated} m/s |{" "}
                    <strong>Cut-out Speed:</strong>{" "}
                    {windmills[activeTab].result?.cut_out} m/s
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Energy:</strong>{" "}
                    {windmills[
                      activeTab
                    ].result?.total_energy_MWh?.toLocaleString()}{" "}
                    MWh
                  </Typography>
                </>
              )}
            </Box>
          </>
        ) : (
          // Comparison view
          <>
            <Box
              sx={{ mb: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}
              aria-label="Comparison summary"
            >
              <Typography variant="h6">
                <b>Total Energy Generated:</b>{" "}
                {windmills
                  .reduce(
                    (sum, w) => sum + (w.result?.total_energy_MWh || 0),
                    0
                  )
                  .toLocaleString()}{" "}
                MWh
              </Typography>
              <Typography variant="h6">
                <b>Total Potential Revenue:</b> $
                {(
                  windmills.reduce(
                    (sum, w) => sum + (w.result?.total_energy_MWh || 0),
                    0
                  ) * PRICE_PER_MWH
                ).toLocaleString()}
              </Typography>
            </Box>

            <ResponsiveContainer
              width="100%"
              height={500}
              aria-label="Comparison chart for all turbines"
            >
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="datetime"
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Energy (MWh)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Wind Speed (m/s)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <RechartsTooltip />
                <Legend />
                {windmills.map((w, i) => {
                  if (!w.result?.daily_energies) return null;
                  const hourlyData = getHourlyData(w);
                  const energyColor = colors[i % colors.length];
                  const strokeDasharray =
                    strokePatterns[i % strokePatterns.length];

                  return (
                    <Line
                      key={w.id}
                      yAxisId="left"
                      type="monotone"
                      data={hourlyData}
                      dataKey="energy_MWh"
                      stroke={energyColor}
                      strokeDasharray={strokeDasharray}
                      name={`Turbine #${i + 1} Energy`}
                      dot={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
