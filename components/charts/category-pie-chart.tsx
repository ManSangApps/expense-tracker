"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7", "#10B981", "#F43F5E", "#84CC16", "#06B6D4"];

export function CategoryPieChart({ data }: { data: { category: string; amount: number }[] }) {
  return (
    <div className="h-72 w-full rounded-xl border p-4">
      <h3 className="mb-3 text-sm font-semibold">Category Distribution</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie data={data.filter((d) => d.amount > 0)} dataKey="amount" nameKey="category" outerRadius={90}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
