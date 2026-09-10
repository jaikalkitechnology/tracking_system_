import { TrackingEvent } from "@/types";
import { formatDateTime } from "@/utils/format";

export function Timeline({ events }: { events: TrackingEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No tracking events yet.</p>;
  }

  const sorted = [...events].sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime());
  const lastIndex = sorted.length - 1;

  return (
    <ol className="relative border-l-2 border-slate-200 pl-6">
      {sorted.map((event, index) => {
        const isLatest = index === lastIndex;
        const isDelivered = event.status === "DELIVERED";
        return (
          <li key={event.id} className="mb-8 last:mb-0">
            <span
              className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${
                isLatest || isDelivered ? "bg-brand-600" : "bg-green-500"
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{event.title}</p>
              {isLatest && !isDelivered && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">Current</span>
              )}
            </div>
            <p className="text-xs text-slate-500">{formatDateTime(event.event_time)}</p>
            {event.location && <p className="mt-1 text-sm text-slate-600">📍 {event.location}</p>}
            {event.description && <p className="mt-1 text-sm text-slate-500">{event.description}</p>}
          </li>
        );
      })}
    </ol>
  );
}
