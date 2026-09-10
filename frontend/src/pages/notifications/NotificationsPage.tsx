import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/api/axios";
import { notificationsApi } from "@/api/notifications";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { Notification, PaginatedResponse } from "@/types";
import { formatDateTime } from "@/utils/format";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Notification> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    notificationsApi
      .list({ page, limit: 15 })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page]);

  const handleMarkRead = async (id: number) => {
    await notificationsApi.markRead(id);
    load();
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Updates about your orders and shipments.</p>
        </div>
        <Button variant="secondary" onClick={handleMarkAllRead}>
          Mark all as read
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="p-5">
            <ErrorState message={error} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="You're all caught up" description="No notifications yet." />
        ) : (
          <>
            <ul className="divide-y divide-slate-100 dark:divide-surface-dark-border">
              {data.items.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start justify-between gap-4 px-5 py-4 ${
                    !n.is_read ? "bg-brand-50/40 dark:bg-brand-500/10" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="whitespace-nowrap text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Mark as read
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
