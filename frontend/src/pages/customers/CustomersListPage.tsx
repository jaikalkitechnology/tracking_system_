import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { customersApi } from "@/api/customers";
import { reportsApi } from "@/api/reports";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { StatCard } from "@/components/charts/StatCard";
import { IconAlertTriangle, IconCustomers, IconPackageCheck, IconSearch } from "@/components/ui/icons";
import { AddAddressModal } from "@/pages/customers/AddAddressModal";
import { CreateCustomerModal } from "@/pages/customers/CreateCustomerModal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Customer, CustomerDetail, PaginatedResponse } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

const AVATAR_TONES = [
  "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function toneFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash];
}

function Avatar({ name, size = "h-9 w-9 text-sm" }: { name: string; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full font-semibold ${toneFor(name)}`}>
      {initialsOf(name)}
    </span>
  );
}

export function CustomersListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [newCustomersTrend, setNewCustomersTrend] = useState<number | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const load = () => {
    setIsLoading(true);
    setError(null);
    customersApi
      .list({ page, limit: 10, search: debouncedSearch || undefined })
      .then((result) => {
        setData(result);
        if (result.items.length > 0 && selectedId === null) {
          setSelectedId(result.items[0].id);
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, debouncedSearch]);

  useEffect(() => {
    Promise.all([
      customersApi.list({ limit: 1 }),
      customersApi.list({ limit: 1, status: "ACTIVE" }),
      customersApi.list({ limit: 1, status: "INACTIVE" }),
    ])
      .then(([all, active, inactive]) => setCounts({ total: all.total, active: active.total, inactive: inactive.total }))
      .catch(() => setCounts(null));

    reportsApi
      .summary(30)
      .then((r) => setNewCustomersTrend(r.new_customers_trend))
      .catch(() => setNewCustomersTrend(null));
  }, []);

  const loadSelectedCustomer = () => {
    if (selectedId === null) {
      setSelectedCustomer(null);
      return;
    }
    setIsLoadingDetail(true);
    customersApi
      .get(selectedId)
      .then(setSelectedCustomer)
      .catch(() => setSelectedCustomer(null))
      .finally(() => setIsLoadingDetail(false));
  };

  useEffect(loadSelectedCustomer, [selectedId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your customer accounts, view order history and details.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Customer</Button>
      </div>

      {counts && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Customers"
            value={counts.total}
            icon={<IconCustomers />}
            tone="brand"
            trend={newCustomersTrend ?? undefined}
            trendLabel="new vs last 30 days"
          />
          <StatCard label="Active" value={counts.active} icon={<IconPackageCheck />} tone="emerald" />
          <StatCard label="Inactive" value={counts.inactive} icon={<IconAlertTriangle />} tone="red" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-slate-100 p-4 dark:border-surface-dark-border">
            <div className="relative max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <IconSearch className="h-4 w-4" />
              </span>
              <Input
                placeholder="Search by name, email or code..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <div className="p-5">
              <ErrorState message={error} />
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState title="No customers found" />
          ) : (
            <>
              <DataTable
                rows={data.items}
                rowKey={(c) => c.id}
                columns={[
                  {
                    header: "Customer",
                    render: (c) => (
                      <button
                        onClick={() => setSelectedId(c.id)}
                        className={`flex items-center gap-3 rounded-lg text-left ${selectedId === c.id ? "font-semibold" : ""}`}
                      >
                        <Avatar name={c.name} />
                        <span>
                          <span className="block font-medium text-brand-600 dark:text-brand-400">{c.name}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{c.email}</span>
                        </span>
                      </button>
                    ),
                  },
                  { header: "Code", render: (c) => c.customer_code },
                  { header: "Orders", render: (c) => c.total_orders },
                  { header: "Spent", render: (c) => formatCurrency(c.total_spent) },
                  { header: "Status", render: (c) => <Badge status={c.status} /> },
                ]}
              />
              <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
            </>
          )}
        </Card>

        <div>
          {isLoadingDetail ? (
            <Card>
              <CardBody>
                <LoadingState label="Loading customer..." />
              </CardBody>
            </Card>
          ) : !selectedCustomer ? (
            <Card>
              <CardBody>
                <EmptyState title="Select a customer" description="Click a row to see their details here." />
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedCustomer.name} size="h-11 w-11 text-base" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{selectedCustomer.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCustomer.customer_code}</p>
                  </div>
                </div>
                <Badge status={selectedCustomer.status} />
              </CardHeader>
              <CardBody className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Contact Information
                  </p>
                  <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <p>{selectedCustomer.email}</p>
                    <p>{selectedCustomer.phone || "-"}</p>
                    <p>Joined {formatDate(selectedCustomer.created_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Orders</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{selectedCustomer.total_orders}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Spent</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                      {formatCurrency(selectedCustomer.total_spent)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Addresses ({selectedCustomer.addresses.length})
                    </p>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      + Add
                    </button>
                  </div>
                  {selectedCustomer.addresses.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500">No addresses on file.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCustomer.addresses.map((addr) => (
                        <div key={addr.id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                          <p>{addr.address_line1}</p>
                          <p>
                            {addr.city}, {addr.state} {addr.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to={`/customers/${selectedCustomer.id}`}
                  className="block text-center text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  View full profile
                </Link>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateCustomerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {showAddAddress && selectedCustomer && (
        <AddAddressModal
          customerId={selectedCustomer.id}
          onClose={() => setShowAddAddress(false)}
          onCreated={() => {
            setShowAddAddress(false);
            loadSelectedCustomer();
          }}
        />
      )}
    </div>
  );
}
