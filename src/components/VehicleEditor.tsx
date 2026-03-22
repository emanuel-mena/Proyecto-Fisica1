import { Slider } from "./Slider";
import type { Vehicle, SimulationParams } from "../simulation/types";
import { LANE_COLORS } from "../simulation/constants";

interface VehicleEditorProps {
  vehicle: Vehicle;
  globalParams: SimulationParams;
  onUpdate: (vehicle: Vehicle) => void;
  onRemove: () => void;
}

export function VehicleEditor({
  vehicle,
  globalParams,
  onUpdate,
  onRemove,
}: VehicleEditorProps) {
  const hasOverride = !!vehicle.params;
  const p = vehicle.params ?? globalParams;

  const laneColor = LANE_COLORS[vehicle.lane];

  function toggleOverride() {
    if (hasOverride) {
      onUpdate({ ...vehicle, params: null });
    } else {
      onUpdate({ ...vehicle, params: { ...globalParams } });
    }
  }

  function setParam<K extends keyof SimulationParams>(key: K) {
    return (value: SimulationParams[K]) => {
      onUpdate({
        ...vehicle,
        params: {
          ...p,
          [key]: value,
        },
      });
    };
  }

  return (
    <div
      style={{
        background: "#0f1623",
        border: `1px solid ${vehicle.color}44`,
        borderLeft: `3px solid ${vehicle.color}`,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: vehicle.color,
              boxShadow: `0 0 8px ${vehicle.color}`,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#e5e7eb",
              fontFamily: "monospace",
            }}
          >
            {vehicle.id.toUpperCase()}
          </span>
          <span
            style={{
              fontSize: 9,
              color: laneColor,
              background: laneColor + "22",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            {vehicle.lane}
          </span>
        </div>

        <div style={{ display: "flex", gap: 5 }}>
          <button
            onClick={toggleOverride}
            style={{
              fontSize: 8,
              padding: "2px 6px",
              borderRadius: 3,
              cursor: "pointer",
              fontWeight: 600,
              border: hasOverride ? "1px solid #f7b731" : "1px solid #374151",
              background: hasOverride ? "#2a1f00" : "transparent",
              color: hasOverride ? "#f7b731" : "#6b7280",
            }}
          >
            {hasOverride ? "⚙ CUSTOM" : "⚙ GLOBAL"}
          </button>

          <button
            onClick={onRemove}
            style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 3,
              cursor: "pointer",
              border: "1px solid #374151",
              background: "transparent",
              color: "#6b7280",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          fontSize: 9,
          color: "#6b7280",
          marginBottom: 6,
          display: "flex",
          gap: 12,
        }}
      >
        <span>{(vehicle.velocity * 3.6).toFixed(1)} km/h</span>
        <span>{vehicle.position.toFixed(1)} m</span>
        <span
          style={{
            color:
              vehicle.state === "braking"
                ? "#ff4444"
                : vehicle.state === "accelerating"
                ? "#00e5ff"
                : "#a0a0ff",
          }}
        >
          {vehicle.acceleration.toFixed(2)} m/s²
        </span>
      </div>

      {/* Sliders (solo si override activo) */}
      {hasOverride && (
        <div
          style={{
            borderTop: "1px solid #1f2937",
            paddingTop: 8,
            marginTop: 4,
          }}
        >
          <Slider
            label="Vel. deseada"
            unit="km/h"
            accent={vehicle.color}
            value={Math.round(p.desiredVelocity * 3.6)}
            min={20}
            max={120}
            step={5}
            onChange={(v) => setParam("desiredVelocity")(v / 3.6)}
          />

          <Slider
            label="Aceleración máx"
            unit="m/s²"
            accent={vehicle.color}
            value={p.maxAcceleration}
            min={0.5}
            max={4}
            step={0.1}
            onChange={setParam("maxAcceleration")}
          />

          <Slider
            label="Frenada confort"
            unit="m/s²"
            accent={vehicle.color}
            value={p.comfortDeceleration}
            min={0.5}
            max={6}
            step={0.1}
            onChange={setParam("comfortDeceleration")}
          />

          <Slider
            label="Gap mínimo (s₀)"
            unit="m"
            accent={vehicle.color}
            value={p.minGap}
            min={0.5}
            max={10}
            step={0.5}
            onChange={setParam("minGap")}
          />

          <Slider
            label="Headway (T)"
            unit="s"
            accent={vehicle.color}
            value={p.timeHeadway}
            min={0.5}
            max={4}
            step={0.1}
            onChange={setParam("timeHeadway")}
          />
        </div>
      )}
    </div>
  );
}