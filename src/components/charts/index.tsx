"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BRAND_COLORS = [
  "#D4AF37",
  "#0A66C2",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const tooltipStyle = {
  backgroundColor: "rgba(8, 12, 20, 0.92)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: 12,
  color: "#fff",
  fontSize: 12,
};

export interface SeriesPoint {
  [key: string]: string | number;
}

interface BaseProps {
  data: SeriesPoint[];
  xKey: string;
  yKeys: string[];
  height?: number;
  labels?: Record<string, string>;
  colors?: string[];
}

export function KalmeronLineChart({ data, xKey, yKeys, height = 280, labels = {}, colors = BRAND_COLORS }: BaseProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.5)" fontSize={11} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(212,175,55,0.3)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
        {yKeys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            name={labels[k] || k}
            stroke={colors[i % colors.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function KalmeronAreaChart({ data, xKey, yKeys, height = 280, labels = {}, colors = BRAND_COLORS }: BaseProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
        <defs>
          {yKeys.map((k, i) => (
            <linearGradient key={k} id={`area-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.5} />
              <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.5)" fontSize={11} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
        {yKeys.map((k, i) => (
          <Area
            key={k}
            type="monotone"
            dataKey={k}
            name={labels[k] || k}
            stroke={colors[i % colors.length]}
            fill={`url(#area-${k})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function KalmeronBarChart({ data, xKey, yKeys, height = 280, labels = {}, colors = BRAND_COLORS }: BaseProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.5)" fontSize={11} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
        {yKeys.map((k, i) => (
          <Bar
            key={k}
            dataKey={k}
            name={labels[k] || k}
            fill={colors[i % colors.length]}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface PieProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  colors?: string[];
}

export function KalmeronPieChart({ data, height = 280, colors = BRAND_COLORS }: PieProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="75%"
          innerRadius="45%"
          paddingAngle={2}
          stroke="rgba(8,12,20,0.6)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
