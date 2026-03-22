import React from "react";

interface SliderProps {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  fmt?: (value: number) => string;
  accent?: string;
}

export function Slider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
  accent = "#00e5ff",
}: SliderProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{label}</span>
        <span style={{ fontSize: 10, color: "#e5e7eb", fontFamily: "monospace" }}>
          {fmt ? fmt(value) : value} {unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: accent,
          cursor: "pointer",
          height: 3,
        }}
      />
    </div>
  );
}