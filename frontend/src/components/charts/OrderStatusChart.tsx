import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { OrderStatusBreakdownItem } from "@/types";
import { useTheme } from "@/context/ThemeContext";

const COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PACKED: "#6366f1",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

export function OrderStatusChart({ data }: { data: OrderStatusBreakdownItem[] }) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "#cbd5e1" : "#334155";
  const tooltipBg = theme === "dark" ? "#161c2e" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#252c42" : "#e2e8f0";
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No orders yet.</p>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={COLORS[entry.status] || "#94a3b8"} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name.replace(/_/g, " ")]}
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: textColor, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-50">{total}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">Total Orders</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[entry.status] || "#94a3b8" }} />
              {entry.status.replace(/_/g, " ")}
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {entry.count} <span className="text-slate-400 dark:text-slate-500">({entry.percent}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
