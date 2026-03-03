"use client";

import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";

export function MonthlyBarChart({ data }: { data: { month: string; amount: number }[] }) {
  return (
    <div className="h-72 w-full rounded-xl border p-4">
      <h3 className="mb-3 text-sm font-semibold">Monthly Trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#2563EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
