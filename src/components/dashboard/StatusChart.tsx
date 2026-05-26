"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";

const colors = ["#64748b", "#10b981", "#ef4444", "#f97316"];

export function StatusChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card className="min-h-80">
      <h3 className="mb-4 text-lg font-black">Test Case Status</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
