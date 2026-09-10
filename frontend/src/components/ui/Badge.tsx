const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  ORDER_CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-indigo-100 text-indigo-800",
  READY_FOR_PICKUP: "bg-indigo-100 text-indigo-800",
  PICKED_UP: "bg-purple-100 text-purple-800",
  IN_TRANSIT: "bg-sky-100 text-sky-800",
  ARRIVED_AT_HUB: "bg-sky-100 text-sky-800",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  ACTIVE: "bg-green-100 text-green-800",
  DELIVERY_FAILED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
  INACTIVE: "bg-slate-100 text-slate-700",
  SUSPENDED: "bg-slate-200 text-slate-700",
  RETURN_REQUESTED: "bg-orange-100 text-orange-800",
  RETURNED: "bg-orange-100 text-orange-800",
  RTO: "bg-orange-100 text-orange-800",
  ON_HOLD: "bg-slate-200 text-slate-700",
  REFUNDED: "bg-slate-200 text-slate-700",
};

export function Badge({ status }: { status: string }) {
  const classes = STATUS_COLORS[status] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
