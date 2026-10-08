import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { notificationsApi } from "@/api/notifications";
import { IconBell } from "@/components/ui/icons";
import { Notification } from "@/types";
import { formatDateTime } from "@/utils/format";

const POLL_INTERVAL_MS = 30000;

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = () => {
    notificationsApi
      .list({ limit: 1, is_read: false })
      .then((r) => setUnreadCount(r.total))
      .catch(() => undefined);
  };

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    notificationsApi
      .list({ limit: 8 })
      .then((r) => setNotifications(r.items))
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (n: Notification) => {
    if (!n.is_read) {
      await notificationsApi.markRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.shipment_id) {
      setOpen(false);
      navigate(`/shipments/${n.shipment_id}`);
    } else if (n.order_id) {
      setOpen(false);
      navigate(`/orders/${n.order_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleClearAll = async () => {
    await notificationsApi.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
        aria-label="Notifications"
      >
        <IconBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-surface-dark-border dark:bg-surface-dark-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-surface-dark-border">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium text-slate-500 hover:underline dark:text-slate-400"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">You&apos;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-surface-dark-border">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleMarkRead(n)}
                      className={`block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                        !n.is_read ? "bg-brand-50/50 dark:bg-brand-500/10" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(n.created_at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="block w-full border-t border-slate-100 px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:underline dark:border-surface-dark-border dark:text-brand-400"
          >
            View notification history
          </button>
        </div>
      )}
    </div>
  );
}
