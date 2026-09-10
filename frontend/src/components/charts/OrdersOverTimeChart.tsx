import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { OrdersOverTimePoint } from "@/api/dashboard";
import { useTheme } from "@/context/ThemeContext";
import { formatDate } from "@/utils/format";

export function OrdersOverTimeChart({ data }: { data: OrdersOverTimePoint[] }) {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#252c42" : "#e2e8f0";
  const textColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const tooltipBg = theme === "dark" ? "#161c2e" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#252c42" : "#e2e8f0";
  const lineColor = theme === "dark" ? "#818cf8" : "#4f46e5";

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No orders in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} fontSize={12} stroke={textColor} tick={{ fill: textColor }} />
        <YAxis allowDecimals={false} fontSize={12} stroke={textColor} tick={{ fill: textColor }} />
        <Tooltip
          labelFormatter={(d) => formatDate(d as string)}
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: textColor, fontSize: 12 }}
        />
        <Line type="monotone" dataKey="count" name="Orders" stroke={lineColor} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
