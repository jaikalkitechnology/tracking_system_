import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ShipmentStatistic } from "@/api/dashboard";

const COLORS = ["#3366ff", "#5a8bff", "#8ab2ff", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#64748b", "#f97316", "#84cc16", "#ec4899", "#14b8a6", "#facc15"];

export function ShipmentStatusChart({ data }: { data: ShipmentStatistic[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No shipment data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [value, name.replace(/_/g, " ")]} />
        <Legend formatter={(value: string) => value.replace(/_/g, " ")} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
