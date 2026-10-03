import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { ordersApi } from "@/api/orders";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { StatCard } from "@/components/charts/StatCard";
import { IconOrders, IconPackageCheck, IconSearch, IconShipments, IconTruckMoving } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useBasePath } from "@/hooks/useBasePath";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Order, PaginatedResponse } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PACKED", "CANCELLED", "COMPLETED"];

export function OrdersListPage() {
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";
  const basePath = useBasePath();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    ordersApi
      .list({ page, limit: 10, search: debouncedSearch || undefined, order_status: status || undefined })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, debouncedSearch, status]);

  useEffect(() => {
    if (!isStaff) return;
    Promise.all([
      ordersApi.list({ limit: 1 }),
      ordersApi.list({ limit: 1, order_status: "PENDING" }),
      ordersApi.list({ limit: 1, order_status: "CONFIRMED" }),
      ordersApi.list({ limit: 1, order_status: "CANCELLED" }),
    ])
      .then(([all, pending, confirmed, cancelled]) =>
        setCounts({ total: all.total, pending: pending.total, confirmed: confirmed.total, cancelled: cancelled.total })
      )
      .catch(() => setCounts(null));
  }, [isStaff]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage customer orders and payment status.</p>
        </div>
        {isStaff && <Button onClick={() => navigate("/orders/new")}>+ New Order</Button>}
      </div>

      {counts && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Orders" value={counts.total} icon={<IconOrders />} tone="brand" />
          <StatCard label="Pending" value={counts.pending} icon={<IconTruckMoving />} tone="amber" />
          <StatCard label="Confirmed" value={counts.confirmed} icon={<IconPackageCheck />} tone="sky" />
          <StatCard label="Cancelled" value={counts.cancelled} icon={<IconShipments />} tone="red" />
        </div>
      )}

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 dark:border-surface-dark-border">
          <div className="relative max-w-xs flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <IconSearch className="h-4 w-4" />
            </span>
            <Input
              placeholder="Search order number..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="max-w-[180px]"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="p-5">
            <ErrorState message={error} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No orders found" description="Try adjusting your filters." />
        ) : (
          <>
            <DataTable
              rows={data.items}
              rowKey={(o) => o.id}
              columns={[
                {
                  header: "Order Number",
                  render: (o) => (
                    <Link to={`${basePath}/orders/${o.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      {o.order_number}
                    </Link>
                  ),
                },
                { header: "Amount", render: (o) => formatCurrency(o.total_amount) },
                { header: "Payment", render: (o) => <Badge status={o.payment_status} /> },
                { header: "Method", render: (o) => (o.payment_method === "COD" ? "COD" : "Online") },
                { header: "Status", render: (o) => <Badge status={o.order_status} /> },
                {
                  header: "Created",
                  render: (o) => (
                    <div>
                      <div>{formatDateTime(o.created_at)}</div>
                      {o.created_by && (
                        <div className="text-xs text-slate-400 dark:text-slate-500">by {o.created_by.name}</div>
                      )}
                    </div>
                  ),
                },
                {
                  header: "Actions",
                  render: (o) => (
                    <Link to={`${basePath}/orders/${o.id}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                      View
                    </Link>
                  ),
                },
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

    </div>
  );
}
