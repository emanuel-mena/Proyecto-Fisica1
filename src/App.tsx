import { useCallback, useEffect, useRef, useState } from "react";

import { ControlPanel } from "./components/ControlPanel";
import { SimulationCanvas } from "./components/SimulationCanvas";
import { GraphPanel } from "./components/GraphPanel";

import { DEFAULT_PARAMS } from "./simulation/constants";
import { updatePhysics } from "./simulation/physics";
import { createVehicle } from "./simulation/vehicleFactory";

import type {
  Lane,
  SimulationParams,
  SimulationState,
  Vehicle,
  VehicleHistory,
} from "./simulation/types";

export default function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

  const [simState, setSimState] = useState<SimulationState>({
    vehicles: [],
    trafficLight: { phase: "ew", phaseState: "green", timer: 0 },
    time: 0,
    isRunning: false,
  });

  const [histories, setHistories] = useState<VehicleHistory[]>([]);

  const animFrameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const paramsRef = useRef(params);

  paramsRef.current = params;

  // ─── Animation Loop ─────────────────────────────────────────────

  const animate = useCallback((ts: number) => {
    if (!lastTsRef.current) lastTsRef.current = ts;

    const wallElapsed = (ts - lastTsRef.current) / 1000;
    const p = paramsRef.current;
    const dt = p.timeStep * p.simulationSpeed;

    if (wallElapsed >= p.timeStep) {
      setSimState((prev) => {
        const next = updatePhysics(prev, p, dt);

        setHistories((prevHistories) => {
          const updated = [...prevHistories];

          next.vehicles.forEach((vehicle) => {
            let history = updated.find(
              (h) => h.vehicleId === vehicle.id
            );

            if (!history) {
              history = { vehicleId: vehicle.id, data: [] };
              updated.push(history);
            }

            history.data.push({
              time: next.time,
              position: vehicle.position,
              velocity: vehicle.velocity,
              acceleration: vehicle.acceleration,
            });

            if (history.data.length > 120) {
              history.data.shift();
            }
          });

          return updated.filter((h) =>
            next.vehicles.some((v) => v.id === h.vehicleId)
          );
        });

        return next;
      });

      lastTsRef.current = ts;
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // ─── Effect: start/stop loop ────────────────────────────────────

  useEffect(() => {
    if (simState.isRunning) {
      lastTsRef.current = 0;
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [simState.isRunning, animate]);

  // ─── Handlers ───────────────────────────────────────────────────

  const handleStart = () => {
    lastTsRef.current = 0;
    setSimState((prev) => ({ ...prev, isRunning: true }));
  };

  const handlePause = () => {
    setSimState((prev) => ({ ...prev, isRunning: false }));
  };

  const handleReset = () => {
    setSimState({
      vehicles: [],
      trafficLight: { phase: "ew", phaseState: "green", timer: 0 },
      time: 0,
      isRunning: false,
    });
    setHistories([]);
  };

  const handleAddVehicle = (lane: Lane | null) => {
    const lanes: Lane[] = ["east", "west", "north", "south"];
    const targetLane =
      lane ?? lanes[Math.floor(Math.random() * lanes.length)];

    setSimState((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, createVehicle(targetLane)],
    }));
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setSimState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === updated.id ? { ...v, params: updated.params } : v
      ),
    }));
  };

  const handleRemoveVehicle = (id: string) => {
    setSimState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
    }));

    setHistories((prev) =>
      prev.filter((h) => h.vehicleId !== id)
    );
  };

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0a0c12",
        fontFamily: "'IBM Plex Mono', monospace",
        overflow: "hidden",
      }}
    >
      <ControlPanel
        params={params}
        setParams={setParams}
        state={simState}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onAddVehicle={handleAddVehicle}
        onUpdateVehicle={handleUpdateVehicle}
        onRemoveVehicle={handleRemoveVehicle}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080a10",
        }}
      >
        <SimulationCanvas
          vehicles={simState.vehicles}
          trafficLight={simState.trafficLight}
        />
      </div>

      <GraphPanel
        vehicleHistories={histories}
        currentTime={simState.time}
      />
    </div>
  );
}