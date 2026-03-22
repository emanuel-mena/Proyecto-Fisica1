import React, { useState } from "react";
import { Slider } from "./Slider";
import { VehicleEditor } from "./VehicleEditor";
import type {
  Lane,
  SimulationParams,
  SimulationState,
  Vehicle,
} from "../simulation/types";
import { LANE_COLORS } from "../simulation/constants";

type ActiveSection = "global" | "vehicles";

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  state: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAddVehicle: (lane: Lane | null) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onRemoveVehicle: (id: string) => void;
}

export function ControlPanel({
  params,
  setParams,
  state,
  onStart,
  onPause,
  onReset,
  onAddVehicle,
  onUpdateVehicle,
  onRemoveVehicle,
}: ControlPanelProps) {
  const { vehicles, trafficLight, time, isRunning } = state;
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("global");

  const updateParam =
    <K extends keyof SimulationParams>(key: K) =>
    (value: SimulationParams[K]) => {
      setParams((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const ewState =
    trafficLight.phase === "ew"
      ? trafficLight.phaseState
      : trafficLight.phaseState === "red"
      ? "green"
      : "red";

  const nsState =
    trafficLight.phase === "ns"
      ? trafficLight.phaseState
      : trafficLight.phaseState === "red"
      ? "green"
      : "red";

  const avgSpeed = vehicles.length
    ? (
        (vehicles.reduce((sum, vehicle) => sum + vehicle.velocity, 0) /
          vehicles.length) *
        3.6
      ).toFixed(1)
    : "—";

  const lanes: Lane[] = ["east", "west", "north", "south"];

  return (
    <div
      style={{
        width: "clamp(300px, 22vw, 420px)",
                flexShrink: 0,
        background: "#0d1117",
        borderRight: "1px solid #1a1f2e",
        padding: "20px 16px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#f9fafb",
            letterSpacing: 2,
            fontFamily: "monospace",
          }}
        >
          TRAFFIC SIM
        </div>
        <div
          style={{
            fontSize: 9,
            color: "#4b5563",
            marginTop: 2,
            letterSpacing: 1,
          }}
        >
          IDM PHYSICS ENGINE v2
        </div>
      </div>

      {/* Main controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={isRunning ? onPause : onStart}
            style={buttonStyle(
              isRunning ? "#6b7280" : "#00e5ff",
              isRunning ? "#0d1117" : "#001820"
            )}
          >
            {isRunning ? "⏸ Pausa" : "▶ Iniciar"}
          </button>

          <button
            onClick={onReset}
            style={buttonStyle("#374151", "#0d1117")}
          >
            ↺ Reset
          </button>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {lanes.map((lane) => (
            <button
              key={lane}
              onClick={() => onAddVehicle(lane)}
              title={`Añadir en ${lane}`}
              style={{
                flex: 1,
                padding: "6px 4px",
                background: `${LANE_COLORS[lane]}18`,
                border: `1px solid ${LANE_COLORS[lane]}55`,
                color: LANE_COLORS[lane],
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 8,
                fontWeight: 700,
              }}
            >
              {lane[0].toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => onAddVehicle(null)}
          style={buttonStyle("#1d4ed8", "#0a1428")}
        >
          + Aleatorio
        </button>
      </div>

      {/* Status */}
      <div
        style={{
          background: "#111827",
          borderRadius: 8,
          padding: "12px 14px",
          border: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {[
            ["E-W", ewState],
            ["N-S", nsState],
          ].map(([label, lightState]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span style={{ fontSize: 9, color: "#6b7280" }}>
                {label}
              </span>
              <TrafficLightDot
                state={lightState as "red" | "yellow" | "green"}
              />
              <span style={{ fontSize: 9, color: "#e5e7eb" }}>
                {lightState}
              </span>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 9, color: "#6b7280" }}>
              Vehículos
            </span>
            <span style={{ fontSize: 9, color: "#e5e7eb" }}>
              {vehicles.length}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 9, color: "#6b7280" }}>
              Vel. media
            </span>
            <span style={{ fontSize: 9, color: "#e5e7eb" }}>
              {avgSpeed} km/h
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gridColumn: "1 / -1",
            }}
          >
            <span style={{ fontSize: 9, color: "#6b7280" }}>
              Tiempo
            </span>
            <span
              style={{
                fontSize: 9,
                color: "#e5e7eb",
                fontFamily: "monospace",
              }}
            >
              {time.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div
        style={{
          display: "flex",
          background: "#111827",
          borderRadius: 6,
          padding: 3,
          border: "1px solid #1f2937",
        }}
      >
        {[
          ["global", "⚙ Global"],
          ["vehicles", `🚗 Vehículos (${vehicles.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as ActiveSection)}
            style={{
              flex: 1,
              padding: "6px 4px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 9,
              fontWeight: 700,
              background:
                activeSection === key ? "#1f2937" : "transparent",
              color:
                activeSection === key ? "#e5e7eb" : "#4b5563",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Global params */}
      {activeSection === "global" && (
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#4b5563",
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            PARÁMETROS GLOBALES IDM
          </div>

          <Slider
            label="Velocidad deseada"
            unit="km/h"
            value={Math.round(params.desiredVelocity * 3.6)}
            min={20}
            max={120}
            step={5}
            onChange={(value) =>
              updateParam("desiredVelocity")(value / 3.6)
            }
          />

          <Slider
            label="Aceleración máxima"
            unit="m/s²"
            value={params.maxAcceleration}
            min={0.5}
            max={4}
            step={0.1}
            onChange={updateParam("maxAcceleration")}
          />

          <Slider
            label="Frenada confort"
            unit="m/s²"
            value={params.comfortDeceleration}
            min={0.5}
            max={6}
            step={0.1}
            onChange={updateParam("comfortDeceleration")}
          />

          <Slider
            label="Gap mínimo (s₀)"
            unit="m"
            value={params.minGap}
            min={0.5}
            max={10}
            step={0.5}
            onChange={updateParam("minGap")}
          />

          <Slider
            label="Headway (T)"
            unit="s"
            value={params.timeHeadway}
            min={0.5}
            max={4}
            step={0.1}
            onChange={updateParam("timeHeadway")}
          />

          <Slider
            label="Velocidad simulación"
            unit="×"
            value={params.simulationSpeed}
            min={0.1}
            max={5}
            step={0.1}
            onChange={updateParam("simulationSpeed")}
          />

          <div
            style={{
              background: "#0a0f1a",
              borderRadius: 6,
              padding: "10px 12px",
              border: "1px solid #1a2d4a",
              marginTop: 8,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#3b82f6",
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              MODELO IDM
            </div>
            <div
              style={{
                fontSize: 8,
                fontFamily: "monospace",
                color: "#6b7280",
                lineHeight: 2,
              }}
            >
              <div>ä = a·[1-(v/v₀)⁴-(s*/s)²]</div>
              <div>s* = s₀ + vT + vΔv/2√(ab)</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {[
              ["#00e5ff", "Acelerando"],
              ["#a0a0ff", "Crucero"],
              ["#ff4444", "Frenando"],
            ].map(([color, label]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 5,
                    borderRadius: 3,
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
                <span style={{ fontSize: 9, color: "#6b7280" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-vehicle controls */}
      {activeSection === "vehicles" && (
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#4b5563",
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            CONTROL INDIVIDUAL
          </div>

          {vehicles.length === 0 && (
            <div
              style={{
                fontSize: 10,
                color: "#374151",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              No hay vehículos en la simulación
            </div>
          )}

          {vehicles.map((vehicle) => (
            <VehicleEditor
              key={vehicle.id}
              vehicle={vehicle}
              globalParams={params}
              onUpdate={onUpdateVehicle}
              onRemove={() => onRemoveVehicle(vehicle.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TrafficLightDotProps {
  state: "red" | "yellow" | "green";
}

function TrafficLightDot({ state }: TrafficLightDotProps) {
  const color =
    state === "red"
      ? "#ff3333"
      : state === "yellow"
      ? "#ffaa00"
      : "#00ff88";

  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        display: "inline-block",
      }}
    />
  );
}

function buttonStyle(border: string, background: string): React.CSSProperties {
  return {
    flex: 1,
    padding: "8px 10px",
    background,
    border: `1px solid ${border}`,
    color: border,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "monospace",
  };
}