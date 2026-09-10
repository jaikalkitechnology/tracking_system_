import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ShipmentStatistic } from "@/api/dashboard";
import { useTheme } from "@/context/ThemeContext";

const COLORS = ["#6366f1", "#818cf8", "#38bdf8", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#64748b", "#fb923c", "#84cc16", "#ec4899", "#14b8a6", "#facc15"];

export function ShipmentStatusChart({ data }: { data: ShipmentStatistic[] }) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "#cbd5e1" : "#334155";
  const tooltipBg = theme === "dark" ? "#161c2e" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#252c42" : "#e2e8f0";

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No shipment data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.status} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [value, name.replace(/_/g, " ")]}
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: textColor, fontSize: 12 }}
          itemStyle={{ color: textColor }}
        />
        <Legend formatter={(value: string) => value.replace(/_/g, " ")} wrapperStyle={{ fontSize: 12, color: textColor }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
