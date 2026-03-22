import { LIGHT_CYCLE, VEHICLE_STOP_POSITION } from "./constants";
import type {
  Lane,
  LightColor,
  TrafficLight,
  Vehicle,
  VirtualLeader,
} from "./types";

export function getLightForLane(lane: Lane, trafficLight: TrafficLight): LightColor {
  const ewLanes: Lane[] = ["east", "west"];
  const isEW = ewLanes.includes(lane);
  const { phase, phaseState } = trafficLight;

  if (phase === "ew") {
    return isEW
      ? phaseState
      : phaseState === "green"
        ? "red"
        : phaseState === "yellow"
          ? "red"
          : "green";
  }

  return !isEW
    ? phaseState
    : phaseState === "green"
      ? "red"
      : phaseState === "yellow"
        ? "red"
        : "green";
}

export function virtualLeader(
  vehicle: Vehicle,
  trafficLight: TrafficLight
): VirtualLeader | null {
  const lightState = getLightForLane(vehicle.lane, trafficLight);

  if (lightState === "green") return null;
  if (vehicle.position >= VEHICLE_STOP_POSITION) return null;

  return {
    position: VEHICLE_STOP_POSITION,
    velocity: 0,
  };
}

export function advanceTrafficLight(
  trafficLight: TrafficLight,
  dt: number
): TrafficLight {
  const newTimer = trafficLight.timer + dt;
  let { phase, phaseState } = trafficLight;
  let resetTimer = false;

  const cycleDuration = LIGHT_CYCLE[phaseState];

  if (newTimer >= cycleDuration) {
    resetTimer = true;

    if (phaseState === "green") {
      phaseState = "yellow";
    } else if (phaseState === "yellow") {
      phaseState = "red";
    } else {
      phase = phase === "ew" ? "ns" : "ew";
      phaseState = "green";
    }
  }

  return {
    phase,
    phaseState,
    timer: resetTimer ? newTimer - cycleDuration : newTimer,
  };
}