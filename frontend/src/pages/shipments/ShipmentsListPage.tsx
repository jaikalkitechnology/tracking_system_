import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { dashboardApi, ShipmentStatistic } from "@/api/dashboard";
import { shipmentsApi } from "@/api/shipments";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { StatCard } from "@/components/charts/StatCard";
import { IconAlertTriangle, IconPackageCheck, IconSearch, IconShipments, IconTruckMoving } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PaginatedResponse, Shipment } from "@/types";
import { formatDate, formatDateTime } from "@/utils/format";

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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState<PaginatedResponse<Shipment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<ShipmentStatistic[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    shipmentsApi
      .list({
        page,
        limit,
        tracking_number: debouncedTracking || undefined,
        order_number: debouncedOrder || undefined,
        status: status || undefined,
        payment_method: paymentMethod || undefined,
      })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [page, limit, debouncedTracking, debouncedOrder, status, paymentMethod]);

  useEffect(() => {
    dashboardApi.shipmentStatistics().then(setStatistics).catch(() => setStatistics([]));
  }, []);

  const countFor = (statuses: string[]) =>
    statistics.filter((s) => statuses.includes(s.status)).reduce((sum, s) => sum + s.count, 0);
  const totalShipments = statistics.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Shipments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage shipment status across couriers.</p>
      </div>

      {statistics.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Shipments" value={totalShipments} icon={<IconShipments />} tone="brand" />
          <StatCard label="In Transit" value={countFor(["IN_TRANSIT", "ARRIVED_AT_HUB", "OUT_FOR_DELIVERY"])} icon={<IconTruckMoving />} tone="sky" />
          <StatCard label="Delivered" value={countFor(["DELIVERED"])} icon={<IconPackageCheck />} tone="emerald" />
          <StatCard label="Failed / Returned" value={countFor(["DELIVERY_FAILED", "RETURNED", "RTO"])} icon={<IconAlertTriangle />} tone="red" />
        </div>
      )}

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 dark:border-surface-dark-border">
          <div className="relative max-w-xs flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <IconSearch className="h-4 w-4" />
            </span>
            <Input
              placeholder="Search tracking number..."
              value={trackingNumber}
              onChange={(e) => {
                setPage(1);
                setTrackingNumber(e.target.value);
              }}
              className="pl-9"
            />
          </div>
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
          <Select
            value={paymentMethod}
            onChange={(e) => {
              setPage(1);
              setPaymentMethod(e.target.value);
            }}
            className="max-w-[180px]"
          >
            <option value="">All payment methods</option>
            <option value="ONLINE">Online</option>
            <option value="COD">Cash on Delivery (COD)</option>
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
                { header: "Created", render: (s) => formatDateTime(s.created_at) },
                { header: "Updated", render: (s) => formatDateTime(s.updated_at) },
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
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={(l) => {
                setPage(1);
                setLimit(l);
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
