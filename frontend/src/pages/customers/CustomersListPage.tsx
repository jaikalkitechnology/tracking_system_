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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your customer accounts.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Customer</Button>
      </div>

      <Card>
        <div className="border-b border-slate-100 p-4 dark:border-surface-dark-border">
          <Input
            placeholder="Search by name, email or code..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="max-w-xs"
          />
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
