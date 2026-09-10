import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { shipmentsApi } from "@/api/shipments";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PaginatedResponse, Shipment } from "@/types";
import { formatDate } from "@/utils/format";

const SHIPMENT_STATUSES = [
  "ORDER_CONFIRMED",
  "PACKED",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_AT_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "RTO",
  "ON_HOLD",
];

export function ShipmentsListPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const debouncedTracking = useDebouncedValue(trackingNumber);
  const debouncedOrder = useDebouncedValue(orderNumber);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Shipment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    shipmentsApi
      .list({
        page,
        limit: 10,
        tracking_number: debouncedTracking || undefined,
        order_number: debouncedOrder || undefined,
        status: status || undefined,
      })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [page, debouncedTracking, debouncedOrder, status]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Shipments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage shipment status across couriers.</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 dark:border-surface-dark-border">
          <Input
            placeholder="Search tracking number..."
            value={trackingNumber}
            onChange={(e) => {
              setPage(1);
              setTrackingNumber(e.target.value);
            }}
            className="max-w-xs"
          />
          <Input
            placeholder="Search order number..."
            value={orderNumber}
            onChange={(e) => {
              setPage(1);
              setOrderNumber(e.target.value);
            }}
            className="max-w-xs"
          />
          <Select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="max-w-[200px]"
          >
            <option value="">All statuses</option>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
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
          <EmptyState title="No shipments found" description="Try adjusting your filters." />
        ) : (
          <>
            <DataTable
              rows={data.items}
              rowKey={(s) => s.id}
              columns={[
                {
                  header: "Tracking Number",
                  render: (s) => (
                    <Link to={`/shipments/${s.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      {s.tracking_number}
                    </Link>
                  ),
                },
                { header: "Shipment #", render: (s) => s.shipment_number },
                { header: "Status", render: (s) => <Badge status={s.status} /> },
                { header: "Est. Delivery", render: (s) => formatDate(s.estimated_delivery_date) },
                { header: "Created", render: (s) => formatDate(s.created_at) },
                {
                  header: "Actions",
                  render: (s) => (
                    <Link to={`/shipments/${s.id}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
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
