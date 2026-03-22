import { ROAD_LENGTH, VEHICLE_LENGTH } from "./constants";
import { idmAcceleration, stateLabel } from "./idm";
import { advanceTrafficLight, virtualLeader } from "./trafficLight";
import type {
  SimulationParams,
  SimulationState,
  Vehicle,
  VirtualLeader,
} from "./types";

type LaneGroups = Partial<Record<Vehicle["lane"], Vehicle[]>>;
type Leader = Vehicle | VirtualLeader | null;

export function updatePhysics(
  state: SimulationState,
  params: SimulationParams,
  dt: number
): SimulationState {
  const { vehicles, trafficLight, time } = state;

  const newLight = advanceTrafficLight(trafficLight, dt);

  const byLane: LaneGroups = {};

  vehicles.forEach((vehicle) => {
    if (!byLane[vehicle.lane]) {
      byLane[vehicle.lane] = [];
    }
    byLane[vehicle.lane]!.push(vehicle);
  });

  Object.keys(byLane).forEach((laneKey) => {
    const lane = laneKey as Vehicle["lane"];
    byLane[lane]!.sort((a, b) => b.position - a.position);
  });

  const updatedVehicles = vehicles
    .map((vehicle) => {
      const laneVehicles = byLane[vehicle.lane] ?? [];
      const idx = laneVehicles.findIndex((v) => v.id === vehicle.id);
      const realLeader = idx > 0 ? laneVehicles[idx - 1] : null;
      const vLeader = virtualLeader(vehicle, newLight);

      let leader: Leader = realLeader;

      if (vLeader) {
        if (!leader || vLeader.position < leader.position) {
          leader = vLeader;
        }
      }

      let acc = idmAcceleration(vehicle, leader, params);

      const activeParams = vehicle.params ?? params;
      const maxBrake = -9.0;

      acc = Math.max(maxBrake, Math.min(activeParams.maxAcceleration, acc));

      let newVelocity = vehicle.velocity + acc * dt;
      newVelocity = Math.max(0, newVelocity);

      if (leader) {
        const safePos =
          leader.position - VEHICLE_LENGTH - activeParams.minGap;

        const predictedPos =
          vehicle.position + vehicle.velocity * dt + 0.5 * acc * dt * dt;

        const clampedPos = Math.min(predictedPos, safePos);

        if (clampedPos < predictedPos) {
          newVelocity = 0;
        }

        return {
          ...vehicle,
          position: Math.max(vehicle.position, clampedPos),
          velocity: newVelocity,
          acceleration: acc,
          state: stateLabel(acc),
        };
      }

      const newPosition =
        vehicle.position + vehicle.velocity * dt + 0.5 * acc * dt * dt;

      return {
        ...vehicle,
        position: newPosition,
        velocity: newVelocity,
        acceleration: acc,
        state: stateLabel(acc),
      };
    })
    .filter((vehicle) => vehicle.position < ROAD_LENGTH);

  return {
    vehicles: updatedVehicles,
    trafficLight: newLight,
    time: time + dt,
    isRunning: true,
  };
}