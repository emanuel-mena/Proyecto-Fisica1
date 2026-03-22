import { VEHICLE_LENGTH } from "./constants";
import type { SimulationParams, Vehicle, VehicleState, VirtualLeader } from "./types";

type Leader = Vehicle | VirtualLeader | null;

export function idmAcceleration(
  vehicle: Vehicle,
  leader: Leader,
  params: SimulationParams
): number {
  const vParams = vehicle.params ?? params;
  const {
    desiredVelocity,
    maxAcceleration,
    comfortDeceleration,
    minGap,
    timeHeadway,
  } = vParams;

  const v = vehicle.velocity;
  const v0 = desiredVelocity;
  const a = maxAcceleration;
  const b = comfortDeceleration;
  const s0 = minGap;
  const T = timeHeadway;

  const gap = leader ? leader.position - vehicle.position - VEHICLE_LENGTH : Infinity;
  const dv = leader ? v - leader.velocity : 0;

  const sStar = s0 + Math.max(0, v * T + (v * dv) / (2 * Math.sqrt(a * b)));
  const freeRoad = Math.pow(v / v0, 4);
  const interaction = leader && gap > 0 ? Math.pow(sStar / gap, 2) : 0;

  return a * (1 - freeRoad - interaction);
}

export function stateLabel(acc: number): VehicleState {
  if (acc > 0.1) return "accelerating";
  if (acc < -0.1) return "braking";
  return "constant";
}