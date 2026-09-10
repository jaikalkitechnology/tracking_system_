const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  ORDER_CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  PACKED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  READY_FOR_PICKUP: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  PICKED_UP: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
  IN_TRANSIT: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  ARRIVED_AT_HUB: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  DELIVERY_FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  INACTIVE: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  SUSPENDED: "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  RETURN_REQUESTED: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  RETURNED: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  RTO: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  ON_HOLD: "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  REFUNDED: "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300",
};

const DOT_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  ORDER_CONFIRMED: "bg-blue-500",
  PACKED: "bg-indigo-500",
  READY_FOR_PICKUP: "bg-indigo-500",
  PICKED_UP: "bg-purple-500",
  IN_TRANSIT: "bg-sky-500",
  ARRIVED_AT_HUB: "bg-sky-500",
  OUT_FOR_DELIVERY: "bg-cyan-500",
  DELIVERED: "bg-emerald-500",
  COMPLETED: "bg-emerald-500",
  PAID: "bg-emerald-500",
  ACTIVE: "bg-emerald-500",
  DELIVERY_FAILED: "bg-red-500",
  FAILED: "bg-red-500",
  CANCELLED: "bg-red-500",
  INACTIVE: "bg-slate-400",
  SUSPENDED: "bg-slate-400",
  RETURN_REQUESTED: "bg-orange-500",
  RETURNED: "bg-orange-500",
  RTO: "bg-orange-500",
  ON_HOLD: "bg-slate-400",
  REFUNDED: "bg-slate-400",
};

export function Badge({ status }: { status: string }) {
  const classes = STATUS_COLORS[status] || "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";
  const dot = DOT_COLORS[status] || "bg-slate-400";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}
