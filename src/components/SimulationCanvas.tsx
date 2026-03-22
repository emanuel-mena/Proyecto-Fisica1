import { useEffect, useRef } from "react";
import {
  VISUAL_STOP_LINE_POSITION,
  VEHICLE_LENGTH,
} from "../simulation/constants";
import type { TrafficLight, Vehicle } from "../simulation/types";

interface SimulationCanvasProps {
  vehicles: Vehicle[];
  trafficLight: TrafficLight;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 560;

const ROAD_PIXEL_HALF = 44;
const LANE_OFFSET = 22;

// Ajustes visuales finos opcionales
const STOP_LINE_OFFSET_X = -45;
const STOP_LINE_OFFSET_Y = -45;

const LIGHT_OFFSET_X = 6;
const LIGHT_OFFSET_Y = 6;

export function SimulationCanvas({
  vehicles,
  trafficLight,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const scales = getWorldScales(cx, cy);

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#0a0c12";
    ctx.fillRect(0, 0, W, H);

    drawRoad(ctx, W, H, cx, cy);

    const stopLines = getStopLinePositions(W, H, cx, cy, scales);

    drawStopLines(ctx, cx, cy, stopLines);
    drawTrafficLights(ctx, cx, cy, stopLines, trafficLight);
    drawVehicles(ctx, W, H, cx, cy, scales, vehicles);
    drawEastLaneGaps(ctx, W, H, cx, cy, scales, vehicles);
    drawVelocityLabels(ctx, W, H, cx, cy, scales, vehicles);
  }, [vehicles, trafficLight]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        borderRadius: 10,
        border: "1px solid #ffffff10",
        display: "block",
      }}
    />
  );
}

interface WorldScales {
  horizontal: number;
  vertical: number;
}

interface StopLinePositions {
  eastX: number;
  westX: number;
  southY: number;
  northY: number;
}

function getWorldScales(cx: number, cy: number): WorldScales {
  return {
    horizontal: (cx - ROAD_PIXEL_HALF) / VISUAL_STOP_LINE_POSITION,
    vertical: (cy - ROAD_PIXEL_HALF) / VISUAL_STOP_LINE_POSITION,
  };
}

function worldToCanvasPosition(
  lane: Vehicle["lane"],
  position: number,
  W: number,
  H: number,
  cx: number,
  cy: number,
  scales: WorldScales
): { x: number; y: number } {
  switch (lane) {
    case "east":
      return {
        x: position * scales.horizontal,
        y: cy - LANE_OFFSET,
      };
    case "west":
      return {
        x: W - position * scales.horizontal,
        y: cy + LANE_OFFSET,
      };
    case "south":
      return {
        x: cx - LANE_OFFSET,
        y: position * scales.vertical,
      };
    case "north":
      return {
        x: cx + LANE_OFFSET,
        y: H - position * scales.vertical,
      };
  }
}

function getStopLinePositions(
  W: number,
  H: number,
  cx: number,
  cy: number,
  scales: WorldScales
): StopLinePositions {
  const east = worldToCanvasPosition(
    "east",
    VISUAL_STOP_LINE_POSITION,
    W,
    H,
    cx,
    cy,
    scales
  );
  const west = worldToCanvasPosition(
    "west",
    VISUAL_STOP_LINE_POSITION,
    W,
    H,
    cx,
    cy,
    scales
  );
  const south = worldToCanvasPosition(
    "south",
    VISUAL_STOP_LINE_POSITION,
    W,
    H,
    cx,
    cy,
    scales
  );
  const north = worldToCanvasPosition(
    "north",
    VISUAL_STOP_LINE_POSITION,
    W,
    H,
    cx,
    cy,
    scales
  );

  return {
    eastX: east.x + STOP_LINE_OFFSET_X,
    westX: west.x - STOP_LINE_OFFSET_X,
    southY: south.y + STOP_LINE_OFFSET_Y,
    northY: north.y - STOP_LINE_OFFSET_Y,
  };
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cx: number,
  cy: number
): void {
  ctx.fillStyle = "#1a1d2e";
  ctx.fillRect(0, cy - ROAD_PIXEL_HALF, W, ROAD_PIXEL_HALF * 2);
  ctx.fillRect(cx - ROAD_PIXEL_HALF, 0, ROAD_PIXEL_HALF * 2, H);

  ctx.fillStyle = "#21243a";
  ctx.fillRect(
    cx - ROAD_PIXEL_HALF,
    cy - ROAD_PIXEL_HALF,
    ROAD_PIXEL_HALF * 2,
    ROAD_PIXEL_HALF * 2
  );

  ctx.strokeStyle = "#ffffff15";
  ctx.lineWidth = 1.5;

  const roadEdges: Array<[number, number, number, number]> = [
    [0, cy - ROAD_PIXEL_HALF, W, cy - ROAD_PIXEL_HALF],
    [0, cy + ROAD_PIXEL_HALF, W, cy + ROAD_PIXEL_HALF],
    [cx - ROAD_PIXEL_HALF, 0, cx - ROAD_PIXEL_HALF, H],
    [cx + ROAD_PIXEL_HALF, 0, cx + ROAD_PIXEL_HALF, H],
  ];

  roadEdges.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  ctx.strokeStyle = "#ffffff28";
  ctx.lineWidth = 1;
  ctx.setLineDash([16, 12]);

  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(cx - ROAD_PIXEL_HALF, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + ROAD_PIXEL_HALF, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, cy - ROAD_PIXEL_HALF);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy + ROAD_PIXEL_HALF);
  ctx.lineTo(cx, H);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawStopLines(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  stopLines: StopLinePositions
): void {
  ctx.strokeStyle = "#ffffffbb";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(stopLines.eastX, cy - ROAD_PIXEL_HALF);
  ctx.lineTo(stopLines.eastX, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(stopLines.westX, cy);
  ctx.lineTo(stopLines.westX, cy + ROAD_PIXEL_HALF);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - ROAD_PIXEL_HALF, stopLines.southY);
  ctx.lineTo(cx, stopLines.southY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, stopLines.northY);
  ctx.lineTo(cx + ROAD_PIXEL_HALF, stopLines.northY);
  ctx.stroke();
}

function drawTrafficLights(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  stopLines: StopLinePositions,
  trafficLight: TrafficLight
): void {
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

  drawTrafficLight(
    ctx,
    stopLines.eastX - LIGHT_OFFSET_X,
    cy - ROAD_PIXEL_HALF - 46,
    ewState
  );

  drawTrafficLight(
    ctx,
    stopLines.westX + LIGHT_OFFSET_X,
    cy + ROAD_PIXEL_HALF + LIGHT_OFFSET_Y,
    ewState
  );

  drawTrafficLight(
    ctx,
    cx - ROAD_PIXEL_HALF - LIGHT_OFFSET_X,
    stopLines.southY - LIGHT_OFFSET_Y,
    nsState
  );

  drawTrafficLight(
    ctx,
    cx + ROAD_PIXEL_HALF + LIGHT_OFFSET_X,
    stopLines.northY + LIGHT_OFFSET_Y,
    nsState
  );
}

function drawTrafficLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: "red" | "yellow" | "green"
): void {
  ctx.fillStyle = "#0d1117";
  ctx.strokeStyle = "#2d3748";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.roundRect(x - 9, y - 3, 18, 42, 5);
  ctx.fill();
  ctx.stroke();

  const bulbs = [
    { col: "#ff3333", active: state === "red", by: y + 7 },
    { col: "#ffaa00", active: state === "yellow", by: y + 18 },
    { col: "#00ff88", active: state === "green", by: y + 29 },
  ];

  bulbs.forEach(({ col, active, by }) => {
    if (active) {
      ctx.shadowColor = col;
      ctx.shadowBlur = 18;
    }

    ctx.fillStyle = active ? col : "#1a2030";
    ctx.beginPath();
    ctx.arc(x, by, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  });
}

function drawVehicles(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cx: number,
  cy: number,
  scales: WorldScales,
  vehicles: Vehicle[]
): void {
  vehicles.forEach((vehicle) => {
    const { x, y, angle } = getVehicleCanvasTransform(
      vehicle,
      W,
      H,
      cx,
      cy,
      scales
    );

    const laneScale =
      vehicle.lane === "east" || vehicle.lane === "west"
        ? scales.horizontal
        : scales.vertical;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const stateColor =
      vehicle.state === "accelerating"
        ? "#00e5ff"
        : vehicle.state === "braking"
        ? "#ff4444"
        : "#a0a0ff";

    ctx.shadowColor = stateColor;
    ctx.shadowBlur = 10;

    const carW = VEHICLE_LENGTH * laneScale;
    const carH = 9;

    ctx.fillStyle = `${vehicle.color}cc`;
    ctx.beginPath();
    ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#c8e6f840";
    ctx.beginPath();
    ctx.roundRect(carW / 2 - 5, -carH / 2 + 1.5, 4, carH - 3, 1);
    ctx.fill();

    ctx.fillStyle = vehicle.state === "braking" ? "#ff4444dd" : "#ff440044";
    ctx.beginPath();
    ctx.arc(-carW / 2 + 1, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-carW / 2 + 1, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffffff";
    ctx.beginPath();
    ctx.arc(carW / 2 - 1, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(carW / 2 - 1, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawEastLaneGaps(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cx: number,
  cy: number,
  scales: WorldScales,
  vehicles: Vehicle[]
): void {
  const eastVehicles = vehicles
    .filter((vehicle) => vehicle.lane === "east")
    .sort((a, b) => a.position - b.position);

  for (let i = 0; i < eastVehicles.length - 1; i += 1) {
    const v1 = eastVehicles[i];
    const v2 = eastVehicles[i + 1];

    const gap = v2.position - v1.position - VEHICLE_LENGTH;

    const rearFront = worldToCanvasPosition(
      "east",
      v1.position + VEHICLE_LENGTH / 2,
      W,
      H,
      cx,
      cy,
      scales
    );

    const frontRear = worldToCanvasPosition(
      "east",
      v2.position - VEHICLE_LENGTH / 2,
      W,
      H,
      cx,
      cy,
      scales
    );

    const labelY = cy - ROAD_PIXEL_HALF - 10;

    ctx.strokeStyle = "#ffffff18";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(rearFront.x, labelY);
    ctx.lineTo(frontRear.x, labelY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ffffff55";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `${gap.toFixed(1)}m`,
      (rearFront.x + frontRear.x) / 2,
      labelY - 3
    );
  }
}

function drawVelocityLabels(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cx: number,
  cy: number,
  scales: WorldScales,
  vehicles: Vehicle[]
): void {
  vehicles.forEach((vehicle) => {
    const base = worldToCanvasPosition(
      vehicle.lane,
      vehicle.position,
      W,
      H,
      cx,
      cy,
      scales
    );

    let x = base.x;
    let y = base.y;

    switch (vehicle.lane) {
      case "east":
        y = cy - 37;
        break;
      case "west":
        y = cy + 50;
        break;
      case "south":
        x = cx - 37;
        break;
      case "north":
        x = cx + 50;
        break;
    }

    ctx.fillStyle = "#ffffff65";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${(vehicle.velocity * 3.6).toFixed(0)}`, x, y);
  });
}

function getVehicleCanvasTransform(
  vehicle: Vehicle,
  W: number,
  H: number,
  cx: number,
  cy: number,
  scales: WorldScales
): { x: number; y: number; angle: number } {
  const pos = worldToCanvasPosition(
    vehicle.lane,
    vehicle.position,
    W,
    H,
    cx,
    cy,
    scales
  );

  switch (vehicle.lane) {
    case "east":
      return { x: pos.x, y: pos.y, angle: 0 };
    case "west":
      return { x: pos.x, y: pos.y, angle: Math.PI };
    case "south":
      return { x: pos.x, y: pos.y, angle: Math.PI / 2 };
    case "north":
      return { x: pos.x, y: pos.y, angle: -Math.PI / 2 };
  }
}