export type Lane = "east" | "west" | "north" | "south";

export type VehicleState = "accelerating" | "braking" | "constant";

export type Phase = "ew" | "ns";

export type LightColor = "green" | "yellow" | "red";

export interface SimulationParams {
  desiredVelocity: number;
  maxAcceleration: number;
  comfortDeceleration: number;
  minGap: number;
  timeHeadway: number;
  simulationSpeed: number;
  timeStep: number;
}

export interface Vehicle {
  id: string;
  lane: Lane;
  position: number;
  velocity: number;
  acceleration: number;
  state: VehicleState;
  color: string;
  params: SimulationParams | null;
}

export interface VirtualLeader {
  position: number;
  velocity: number;
}

export interface TrafficLight {
  phase: Phase;
  phaseState: LightColor;
  timer: number;
}

export interface SimulationState {
  vehicles: Vehicle[];
  trafficLight: TrafficLight;
  time: number;
  isRunning: boolean;
}

export interface VehicleHistoryPoint {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
}

export interface VehicleHistory {
  vehicleId: string;
  data: VehicleHistoryPoint[];
}