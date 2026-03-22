import { COLORS } from "./constants";
import type { Lane, SimulationParams, Vehicle } from "./types";

let idCounter = 0;

export function createVehicle(
  lane: Lane,
  overrideParams: SimulationParams | null = null
): Vehicle {
  idCounter += 1;

  return {
    id: `v${idCounter}`,
    lane,
    position: Math.random() * 5,
    velocity: Math.random() * 2,
    acceleration: 0,
    state: "accelerating",
    color: COLORS[idCounter % COLORS.length],
    params: overrideParams,
  };
}

export function resetVehicleIdCounter(): void {
  idCounter = 0;
}