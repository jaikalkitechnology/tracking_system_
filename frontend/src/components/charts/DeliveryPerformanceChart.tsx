import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardSummary } from "@/types";

export function DeliveryPerformanceChart({ summary }: { summary: DashboardSummary }) {
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip />
        <Bar dataKey="value" fill="#3366ff" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
