// Replaced react-leaflet with native inputs (Ponytail philosophy)
import React from "react";
import { Input } from "./ui/Input";

export default function MapPicker({ location, setLocation }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update location with simple text inputs instead of map coordinates
    setLocation((prev) => ({
      ...prev,
      [name]: value,
      address: `${prev.city || ""} ${prev.street || ""}`.trim(),
    }));
  };

  return (
    <div className="space-y-4">
      <Input
        label="City"
        name="city"
        value={location.city || ""}
        onChange={handleChange}
        placeholder="Enter city"
      />
      <Input
        label="Street / Landmark"
        name="street"
        value={location.street || ""}
        onChange={handleChange}
        placeholder="Enter street or landmark"
      />
      <p className="text-sm text-gray-400">
        Map functionality has been simplified to text inputs for minimalism.
      </p>
    </div>
  );
}
