import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/api/axios";
import { settingsApi } from "@/api/settings";
import { usersApi } from "@/api/users";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { DataTable } from "@/components/tables/DataTable";
import { useAuth } from "@/context/AuthContext";
import { PaginatedResponse, StoreSettings, User } from "@/types";
import { formatDate } from "@/utils/format";

type Tab = "general" | "notifications" | "users";

const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "users", label: "Users" },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1.5 text-left"
    >
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-slate-300 dark:bg-white/10"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN");

  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setIsLoading(true);
    settingsApi
      .get()
      .then(setForm)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    setError(null);
    try {
      const { updated_at: _updatedAt, ...payload } = form;
      const updated = await settingsApi.update(payload);
      setForm(updated);
      setSaved(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error && !form) return <ErrorState message={error} />;
  if (!form) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your store settings, company details and preferences.</p>
        </div>
        {tab !== "users" && isAdmin && (
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved</span>}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}

      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-surface-dark-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="max-w-xl">
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Admin Details</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Name</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Phone</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user?.phone || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Role</span>
                <Badge status={user?.role} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <Badge status={user?.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Joined</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user ? formatDate(user.created_at) : "-"}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="max-w-xl">
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Store Preferences</h2>
            </CardHeader>
            <CardBody className="divide-y divide-slate-100 dark:divide-surface-dark-border">
              <Toggle checked={form.allow_guest_checkout} onChange={(v) => set("allow_guest_checkout", v)} label="Allow Guest Checkout" />
              <Toggle checked={form.show_low_stock_alerts} onChange={(v) => set("show_low_stock_alerts", v)} label="Show Low Stock Alerts" />
              <Toggle checked={form.enable_product_reviews} onChange={(v) => set("enable_product_reviews", v)} label="Enable Product Reviews" />
              <Toggle checked={form.enable_inventory_tracking} onChange={(v) => set("enable_inventory_tracking", v)} label="Enable Inventory Tracking" />
              <Toggle checked={form.maintenance_mode} onChange={(v) => set("maintenance_mode", v)} label="Maintenance Mode" />
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "notifications" && (
        <Card className="max-w-xl">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
          </CardHeader>
          <CardBody className="divide-y divide-slate-100 dark:divide-surface-dark-border">
            <Toggle checked={form.send_order_notifications} onChange={(v) => set("send_order_notifications", v)} label="Send Order Notifications" />
            <Toggle checked={form.show_low_stock_alerts} onChange={(v) => set("show_low_stock_alerts", v)} label="Show Low Stock Alerts" />
          </CardBody>
        </Card>
      )}

      {tab === "users" && <UsersTab />}
    </div>
  );
}

function UsersTab() {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    usersApi
      .list({ limit: 50 })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Staff Users</h2>
      </CardHeader>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <CardBody>
          <ErrorState message={error} />
        </CardBody>
      ) : !data || data.items.length === 0 ? (
        <CardBody>
          <p className="text-sm text-slate-400 dark:text-slate-500">No staff users yet.</p>
        </CardBody>
      ) : (
        <DataTable
          rows={data.items}
          rowKey={(u) => u.id}
          columns={[
            { header: "Name", render: (u) => u.name },
            { header: "Email", render: (u) => u.email },
            { header: "Role", render: (u) => <Badge status={u.role} /> },
            { header: "Status", render: (u) => <Badge status={u.status} /> },
            { header: "Joined", render: (u) => formatDate(u.created_at) },
          ]}
        />
      )}
    </Card>
  );
}
