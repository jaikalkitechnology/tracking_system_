import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useTheme } from "@/context/ThemeContext";
import { DashboardSummary } from "@/types";

export function DeliveryPerformanceChart({ summary }: { summary: DashboardSummary }) {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#252c42" : "#e2e8f0";
  const textColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const tooltipBg = theme === "dark" ? "#161c2e" : "#ffffff";
  const tooltipBorder = theme === "dark" ? "#252c42" : "#e2e8f0";
  const barColor = theme === "dark" ? "#818cf8" : "#6366f1";

  const data = [
    { name: "Pending", value: summary.pending },
    { name: "Picked Up", value: summary.picked_up },
    { name: "In Transit", value: summary.in_transit },
    { name: "Out for Delivery", value: summary.out_for_delivery },
    { name: "Delivered", value: summary.delivered },
    { name: "Failed", value: summary.failed_deliveries },
    { name: "Returns", value: summary.returns },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} stroke={textColor} tick={{ fill: textColor }} />
        <YAxis allowDecimals={false} fontSize={12} stroke={textColor} tick={{ fill: textColor }} />
        <Tooltip
          cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }}
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: textColor, fontSize: 12 }}
        />
        <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
