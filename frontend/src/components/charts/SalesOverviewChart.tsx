import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { SalesOverviewPoint } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import { formatCurrency, formatDate } from "@/utils/format";

export function SalesOverviewChart({ data }: { data: SalesOverviewPoint[] }) {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#252c42" : "#e2e8f0";
  const textColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const tooltipBg = theme === "dark" ? "#161c2e" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#252c42" : "#e2e8f0";
  const ordersColor = theme === "dark" ? "#818cf8" : "#4f46e5";
  const revenueColor = theme === "dark" ? "#38bdf8" : "#0ea5e9";

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No sales in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} fontSize={12} stroke={textColor} tick={{ fill: textColor }} />
        <YAxis yAxisId="orders" allowDecimals={false} fontSize={12} stroke={textColor} tick={{ fill: textColor }} />
        <YAxis
          yAxisId="revenue"
          orientation="right"
          fontSize={12}
          stroke={textColor}
          tick={{ fill: textColor }}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <Tooltip
          labelFormatter={(d) => formatDate(d as string)}
          formatter={(value: number, name: string) => (name === "Revenue" ? formatCurrency(value) : value)}
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: textColor, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: textColor }} />
        <Bar yAxisId="orders" dataKey="orders" name="Orders" fill={ordersColor} radius={[4, 4, 0, 0]} />
        <Bar yAxisId="revenue" dataKey="revenue" name="Revenue" fill={revenueColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
