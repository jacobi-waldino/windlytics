import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  TextField,
} from "@mui/material";

export default function NumberInput() {
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <TextField
      label="# of Wind Turbines"
      type="number"
      value={value}
      onChange={handleChange}
      // InputLabelProps={{
      //   shrink: true,
      // }}
      variant="outlined"
    />
  );
}