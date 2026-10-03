import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/api/axios";
import { settingsApi } from "@/api/settings";
import { usersApi } from "@/api/users";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input, Label, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { DataTable } from "@/components/tables/DataTable";
import { useAuth } from "@/context/AuthContext";
import { PaginatedResponse, StoreSettings, User, UserRole } from "@/types";
import { formatDate } from "@/utils/format";

type Tab = "general" | "company" | "billing" | "shipping" | "payment" | "notifications" | "users";

const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "company", label: "Company" },
  { key: "billing", label: "Billing & Tax" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
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
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Store Information</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <Label>Store Name</Label>
                <Input value={form.store_name} onChange={(e) => set("store_name", e.target.value)} />
              </div>
              <div>
                <Label>Store Email</Label>
                <Input type="email" value={form.store_email || ""} onChange={(e) => set("store_email", e.target.value)} />
              </div>
              <div>
                <Label>Store Phone</Label>
                <Input value={form.store_phone || ""} onChange={(e) => set("store_phone", e.target.value)} />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website || ""} onChange={(e) => set("website", e.target.value)} />
              </div>
              <div>
                <Label>Store Logo URL</Label>
                <Input value={form.logo_url || ""} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." />
              </div>
            </CardBody>
          </Card>

          <Card>
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

      {tab === "company" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Business Address</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <Label>Address Line 1</Label>
                <Input value={form.address_line1 || ""} onChange={(e) => set("address_line1", e.target.value)} />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input value={form.address_line2 || ""} onChange={(e) => set("address_line2", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={form.state || ""} onChange={(e) => set("state", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>PIN Code</Label>
                  <Input value={form.pincode || ""} onChange={(e) => set("pincode", e.target.value)} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Contact Person</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Name</Label>
                  <Input value={form.contact_name || ""} onChange={(e) => set("contact_name", e.target.value)} />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input value={form.contact_designation || ""} onChange={(e) => set("contact_designation", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input type="email" value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} />
              </div>
              <div>
                <Label>Alternate Email</Label>
                <Input type="email" value={form.contact_alternate_email || ""} onChange={(e) => set("contact_alternate_email", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Number</Label>
                  <Input value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} />
                </div>
                <div>
                  <Label>Alternate Number</Label>
                  <Input value={form.contact_alternate_phone || ""} onChange={(e) => set("contact_alternate_phone", e.target.value)} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "billing" && (
        <Card className="max-w-xl">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Billing & Tax</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Label>Tax Rate (GST %)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.tax_rate_percent}
                onChange={(e) => set("tax_rate_percent", Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </Select>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "shipping" && (
        <Card className="max-w-xl">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipping</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Label>Default Shipping Charges (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.default_shipping_charge}
                onChange={(e) => set("default_shipping_charge", Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Free Shipping Threshold (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.free_shipping_threshold ?? ""}
                onChange={(e) => set("free_shipping_threshold", e.target.value ? Number(e.target.value) : null)}
                placeholder="No free shipping threshold"
              />
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "payment" && (
        <Card className="max-w-xl">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Orders accept Online Payment or Cash on Delivery, chosen per order at checkout. No payment gateway is
              connected to this admin yet.
            </p>
          </CardBody>
        </Card>
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

      {tab === "users" && <UsersTab isAdmin={!!isAdmin} />}
    </div>
  );
}

function UsersTab({ isAdmin }: { isAdmin: boolean }) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

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
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Staff Users</h2>
        {isAdmin && <Button onClick={() => setShowCreate(true)}>+ Add User</Button>}
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

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </Card>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("WAREHOUSE");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!name || !email || !password) {
      setError("Name, email and password are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await usersApi.create({ name, email, password, phone: phone || undefined, role });
      onCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl dark:border-surface-dark-border dark:bg-surface-dark-subtle">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-surface-dark-border">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Add Staff User</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            ✕
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="WAREHOUSE">Warehouse</option>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-surface-dark-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  );
}
