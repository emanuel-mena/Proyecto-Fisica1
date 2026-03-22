import type { SimulationParams } from "./types";

export const ROAD_LENGTH = 400;
export const INTERSECTION = 200;
export const ROAD_HALF = 15;
export const VEHICLE_LENGTH = 10;

export const INTERSECTION_ENTRY = INTERSECTION - ROAD_HALF;

export const VEHICLE_STOP_MARGIN = 0;
export const VEHICLE_STOP_POSITION = INTERSECTION_ENTRY - VEHICLE_STOP_MARGIN ;

export const VISUAL_STOP_LINE_POSITION = VEHICLE_STOP_POSITION;

export const COLORS = [
  "#00e5ff",
  "#ff6b35",
  "#a8ff3e",
  "#ff3cac",
  "#f7b731",
  "#45aaf2",
  "#c084fc",
  "#fb923c",
];

export const DEFAULT_PARAMS: SimulationParams = {
  desiredVelocity: 13.9,
  maxAcceleration: 1.5,
  comfortDeceleration: 2.0,
  minGap: 2.0,
  timeHeadway: 1.5,
  simulationSpeed: 1.0,
  timeStep: 0.05,
};

export const LIGHT_CYCLE = {
  green: 12,
  yellow: 3,
  red: 8,
} as const;

export const LANE_COLORS = {
  east: "#00e5ff",
  west: "#ff6b35",
  south: "#a8ff3e",
  north: "#ff3cac",
} as const;