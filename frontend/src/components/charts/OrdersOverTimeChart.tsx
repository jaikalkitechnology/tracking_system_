import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { OrdersOverTimePoint } from "@/api/dashboard";
import { formatDate } from "@/utils/format";

export function OrdersOverTimeChart({ data }: { data: OrdersOverTimePoint[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No orders in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip labelFormatter={(d) => formatDate(d as string)} />
        <Line type="monotone" dataKey="count" name="Orders" stroke="#3366ff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
