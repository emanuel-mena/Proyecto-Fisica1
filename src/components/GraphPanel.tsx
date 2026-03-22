import { useMemo, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import type { VehicleHistory } from "../simulation/types";
import { COLORS } from "../simulation/constants";

type GraphTab = "velocity" | "position" | "acceleration";

interface GraphPanelProps {
    vehicleHistories: VehicleHistory[];
    currentTime: number;
}

interface ChartPoint {
    time: number;
    [key: string]: number | undefined;
}

export function GraphPanel({
    vehicleHistories,
    currentTime,
}: GraphPanelProps) {
    const [activeTab, setActiveTab] = useState<GraphTab>("velocity");

    const dataKeyPrefix =
        activeTab === "velocity"
            ? "v_"
            : activeTab === "position"
                ? "s_"
                : "a_";

    const unit =
        activeTab === "velocity"
            ? "m/s"
            : activeTab === "position"
                ? "m"
                : "m/s²";

    const chartData = useMemo<ChartPoint[]>(() => {
        if (!vehicleHistories.length) return [];

        const map = new Map<number, ChartPoint>();

        vehicleHistories.forEach((history) => {
            history.data.forEach((point) => {
                const t = Math.round(point.time * 5) / 5;

                if (!map.has(t)) {
                    map.set(t, { time: t });
                }

                const entry = map.get(t)!;

                entry[`${dataKeyPrefix}${history.vehicleId}`] =
                    activeTab === "velocity"
                        ? point.velocity
                        : activeTab === "position"
                            ? point.position
                            : point.acceleration;
            });
        });

        return Array.from(map.values())
            .sort((a, b) => a.time - b.time)
            .slice(-60);
    }, [vehicleHistories, activeTab, dataKeyPrefix]);

    const tabs: GraphTab[] = ["velocity", "position", "acceleration"];

    return (
        <div
            style={{
                width: "clamp(300px, 22vw, 420px)",
                flexShrink: 0,
                background: "#0d1117",
                borderLeft: "1px solid #1a1f2e",
                padding: "20px 14px",
                overflowY: "auto",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 14 }}>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#f9fafb",
                        fontFamily: "monospace",
                    }}
                >
                    MÉTRICAS EN VIVO
                </div>
                <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>
                    t = {currentTime.toFixed(1)}s
                </div>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 4,
                    marginBottom: 14,
                    background: "#111827",
                    borderRadius: 6,
                    padding: 3,
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: "5px 4px",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 8,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: activeTab === tab ? "#1f2937" : "transparent",
                            color: activeTab === tab ? "#e5e7eb" : "#4b5563",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div
                style={{
                    background: "#111827",
                    borderRadius: 8,
                    padding: "12px 8px",
                    border: "1px solid #1f2937",
                }}
            >
                <ResponsiveContainer width="100%" height={190}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 4, right: 8, bottom: 16, left: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 8, fill: "#4b5563" }}
                            label={{
                                value: "tiempo (s)",
                                position: "insideBottom",
                                offset: -8,
                                fontSize: 8,
                                fill: "#4b5563",
                            }}
                        />

                        <YAxis
                            tick={{ fontSize: 8, fill: "#4b5563" }}
                            label={{
                                value: unit,
                                angle: -90,
                                position: "insideLeft",
                                fontSize: 8,
                                fill: "#4b5563",
                            }}
                        />

                        <Tooltip
                            contentStyle={{
                                background: "#0d1117",
                                border: "1px solid #1f2937",
                                fontSize: 9,
                            }}
                            formatter={(value) => {
                                const numericValue =
                                    typeof value === "number" ? value : Number(value ?? 0);
                                return `${numericValue.toFixed(2)} ${unit}`;
                            }}
                            labelFormatter={(label) => `t=${label}s`}
                        />

                        {vehicleHistories.map((history, i) => (
                            <Line
                                key={history.vehicleId}
                                type="monotone"
                                dataKey={`${dataKeyPrefix}${history.vehicleId}`}
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={1.5}
                                dot={false}
                                name={history.vehicleId}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Snapshot */}
            {vehicleHistories.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <div
                        style={{
                            fontSize: 9,
                            color: "#4b5563",
                            marginBottom: 8,
                            fontWeight: 700,
                            letterSpacing: 1,
                        }}
                    >
                        SNAPSHOT
                    </div>

                    {vehicleHistories.map((history, i) => {
                        const last = history.data[history.data.length - 1];
                        if (!last) return null;

                        return (
                            <div
                                key={history.vehicleId}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "#111827",
                                    borderRadius: 6,
                                    padding: "7px 10px",
                                    marginBottom: 5,
                                    border: "1px solid #1f2937",
                                    borderLeft: `3px solid ${COLORS[i % COLORS.length]
                                        }`,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 9,
                                        color: "#9ca3af",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    {history.vehicleId}
                                </span>

                                <span
                                    style={{
                                        fontSize: 9,
                                        color: "#e5e7eb",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    {(last.velocity * 3.6).toFixed(1)} km/h
                                </span>

                                <span
                                    style={{
                                        fontSize: 9,
                                        color: "#e5e7eb",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    {last.position.toFixed(1)} m
                                </span>

                                <span
                                    style={{
                                        fontSize: 9,
                                        color:
                                            last.acceleration < -0.1
                                                ? "#ff4444"
                                                : last.acceleration > 0.1
                                                    ? "#00e5ff"
                                                    : "#a0a0ff",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    {last.acceleration > 0 ? "+" : ""}
                                    {last.acceleration.toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}