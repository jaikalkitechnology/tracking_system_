import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { customersApi } from "@/api/customers";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { StatCard } from "@/components/charts/StatCard";
import { IconAlertTriangle, IconCustomers, IconPackageCheck, IconSearch } from "@/components/ui/icons";
import { CreateCustomerModal } from "@/pages/customers/CreateCustomerModal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Customer, PaginatedResponse } from "@/types";
import { formatDate } from "@/utils/format";

export function CustomersListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    customersApi
      .list({ page, limit: 10, search: debouncedSearch || undefined })
      .then(setData)
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
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your customer accounts.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Customer</Button>
      </div>

      {counts && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Customers" value={counts.total} icon={<IconCustomers />} tone="brand" />
          <StatCard label="Active" value={counts.active} icon={<IconPackageCheck />} tone="emerald" />
          <StatCard label="Inactive" value={counts.inactive} icon={<IconAlertTriangle />} tone="red" />
        </div>
      )}

      <Card>
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
                    <Link to={`/customers/${c.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      {c.name}
                    </Link>
                  ),
                },
                { header: "Code", render: (c) => c.customer_code },
                { header: "Email", render: (c) => c.email },
                { header: "Phone", render: (c) => c.phone || "-" },
                { header: "Status", render: (c) => <Badge status={c.status} /> },
                { header: "Joined", render: (c) => formatDate(c.created_at) },
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showCreate && (
        <CreateCustomerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}
