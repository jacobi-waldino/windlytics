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
} from "@mui/material";
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

const colors = ["#1976d2", "#ff6d00", "#388e3c", "#9c27b0", "#fbc02d"];
const PRICE_PER_MWH = 50; // $/MWh, adjust as needed

export default function SimulationModal({ open, onClose, windmills }) {
  const [activeTab, setActiveTab] = useState(0);
  const [comparison, setComparison] = useState(false);

  const handleTabChange = (e, newValue) => setActiveTab(newValue);

  // Helper to compute total energy & revenue
  const getSummary = (w) => {
    if (!w?.result?.daily_energies) return null;
    const totalEnergy = w.result.total_energy_MWh || w.result.dailzy_energies.reduce((sum, d) => sum + (d.daily_energy_MWh || 0), 0);
    const revenue = (totalEnergy * PRICE_PER_MWH).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return { totalEnergy, revenue };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Results 
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setComparison((prev) => !prev)}
          >
            {comparison ? "Individual View" : "Comparison View"}
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!comparison ? (
          <>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 1 }}
            >
              {windmills.map((w, i) => (
                <Tab key={w.id} label={`Turbine #${i + 1}`} />
              ))}
            </Tabs>

            {/* Summary above chart */}
            {windmills[activeTab] && windmills[activeTab].result && (
              (() => {
                const summary = getSummary(windmills[activeTab]);
                if (!summary) return null;
                return (
                  <Box sx={{ mb: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
                    <Typography variant="h6">
                      <b>Total Energy Generated:</b> {summary.totalEnergy.toLocaleString()} MWh
                    </Typography>
                    <Typography variant="h6">
                      <b>Potential Revenue:</b> ${summary.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                );
              })()
            )}

            {windmills.map((w, i) => (
              <Box
                key={w.id}
                role="tabpanel"
                hidden={activeTab !== i}
                sx={{ height: 400 }}
              >
                {w.result?.daily_energies ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={w.result.daily_energies}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
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
                        dataKey="daily_energy_MWh"
                        stroke="#1976d2"
                        name="Energy (MWh)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="predicted_wind_speed"
                        stroke="#ff6d00"
                        name="Wind Speed (m/s)"
                      />
                      <ReferenceLine
                        y={w.result?.cut_in}
                        yAxisId="right"
                        stroke="red"
                        strokeDasharray="3 3"
                        label="Cut-in"
                      />
                      <ReferenceLine
                        y={w.result?.rated}
                        yAxisId="right"
                        stroke="green"
                        strokeDasharray="3 3"
                        label="Rated"
                      />
                      <ReferenceLine
                        y={w.result?.cut_out}
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
              </Box>
            ))}

            {/* Metadata at the bottom */}
            {windmills[activeTab] && windmills[activeTab].result && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {windmills[activeTab].type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {windmills[activeTab].result?.message || ""}
                </Typography>
                <Typography variant="body2">
                  <strong>Rated Power:</strong>{" "}
                  {windmills[activeTab].result?.rated_power?.toLocaleString()} kW
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
                  <strong>Cut-in Wind Speed:</strong>{" "}
                  {windmills[activeTab].result?.cut_in} m/s |{" "}
                  <strong>Rated Wind Speed:</strong>{" "}
                  {windmills[activeTab].result?.rated} m/s |{" "}
                  <strong>Cut-out Wind Speed:</strong>{" "}
                  {windmills[activeTab].result?.cut_out} m/s
                </Typography>
                <Typography variant="body2">
                  <strong>Total Energy:</strong>{" "}
                  {windmills[activeTab].result?.total_energy_MWh?.toLocaleString()} MWh
                </Typography>
              </Box>
            )}
          </>
        ) : (
          // Comparison view
          <>
            {/* Overall summary above chart */}
            {(() => {
              const totalEnergy = windmills.reduce(
                (sum, w) => sum + (w.result?.total_energy_MWh || 0),
                0
              );
              const totalRevenue = totalEnergy * PRICE_PER_MWH;
              return (
                <Box sx={{ mb: 1, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Total Energy Generated: {totalEnergy.toLocaleString()} MWh
                  </Typography>
                  <Typography variant="subtitle2">
                    Potential Revenue: ${totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
              );
            })()}

            <ResponsiveContainer width="100%" height={500}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
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
                  const energyColor = colors[(i * 2) % colors.length];
                  const windColor = colors[(i * 2 + 1) % colors.length];
                  return (
                    <React.Fragment key={w.id}>
                      <Line
                        yAxisId="left"
                        type="monotone"
                        data={w.result.daily_energies}
                        dataKey="daily_energy_MWh"
                        stroke={energyColor}
                        name={`Turbine #${i + 1} Energy`}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        data={w.result.daily_energies}
                        dataKey="predicted_wind_speed"
                        stroke={windColor}
                        strokeDasharray="5 5"
                        name={`Turbine #${i + 1} Wind`}
                      />
                    </React.Fragment>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>

            {/* Metadata at the bottom */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
              {windmills.map((w, i) => (
                <Box key={w.id} sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Turbine #{i + 1}: {w.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {w.result?.message || ""}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rated Power:</strong>{" "}
                    {w.result?.rated_power?.toLocaleString()} kW
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rotor Diameter:</strong> {w.result?.rotor_diameter} m
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tip Height:</strong> {w.result?.tip_height} m
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cut-in Wind Speed:</strong> {w.result?.cut_in} m/s |{" "}
                    <strong>Rated Wind Speed:</strong> {w.result?.rated} m/s |{" "}
                    <strong>Cut-out Wind Speed:</strong> {w.result?.cut_out} m/s
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Energy:</strong>{" "}
                    {w.result?.total_energy_MWh?.toLocaleString()} MWh
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
