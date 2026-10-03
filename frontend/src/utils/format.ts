export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
}

// The backend sends naive UTC timestamps (no "Z" / offset suffix). Without
// this, `new Date(value)` would parse them as local time instead of UTC,
// silently shifting every displayed time by the viewer's UTC offset.
function toUtcDate(value: string): Date {
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

const INDIA_TIME_ZONE = "Asia/Kolkata";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return toUtcDate(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: INDIA_TIME_ZONE,
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return toUtcDate(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: INDIA_TIME_ZONE,
  });
}
