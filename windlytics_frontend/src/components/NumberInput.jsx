import React from "react";
import "leaflet/dist/leaflet.css";
import { TextField } from "@mui/material";

export default function NumberInput({ value, onChange }) {
  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else {
      onChange(""); // handle clearing input
    }
  };

  return (
    <TextField
      label="# of Wind Turbines"
      type="number"
      value={value}
      onChange={handleChange}
      variant="outlined"
      fullWidth
      InputProps={{ inputProps: { min: 1 } }} // optional: enforce min value
    />
  );
}
