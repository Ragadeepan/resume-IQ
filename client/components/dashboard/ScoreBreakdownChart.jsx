"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const BAR_COLORS = ["#0f9bb0", "#ff8a57", "#f7cb73", "#6884ff"];

export function ScoreBreakdownChart({ breakdown }) {
  const data = Object.entries(breakdown || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  }));

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -10 }}>
          <CartesianGrid vertical={false} stroke="rgba(128, 145, 160, 0.24)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 11 }} />
          <YAxis domain={[0, 30]} tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 11 }} width={28} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            contentStyle={{
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.82)",
              background: "rgba(255,255,255,0.94)",
              boxShadow: "0 20px 42px rgba(9, 21, 35, 0.12)"
            }}
          />
          <Bar dataKey="score" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
