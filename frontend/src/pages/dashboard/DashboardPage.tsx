import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { dashboardApi, OrdersOverTimePoint, ShipmentStatistic } from "@/api/dashboard";
import { getApiErrorMessage } from "@/api/axios";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DeliveryPerformanceChart } from "@/components/charts/DeliveryPerformanceChart";
import { OrdersOverTimeChart } from "@/components/charts/OrdersOverTimeChart";
import { ShipmentStatusChart } from "@/components/charts/ShipmentStatusChart";
import { StatCard } from "@/components/charts/StatCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { DataTable } from "@/components/tables/DataTable";
import { IconAlertTriangle, IconClock, IconOrders, IconPackageCheck, IconShipments, IconTruckMoving } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { DashboardSummary, RecentActivity, Shipment } from "@/types";
import { formatDateTime } from "@/utils/format";

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statistics, setStatistics] = useState<ShipmentStatistic[]>([]);
  const [ordersOverTime, setOrdersOverTime] = useState<OrdersOverTimePoint[]>([]);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.shipmentStatistics(),
      dashboardApi.ordersOverTime(),
      dashboardApi.recentShipments(5),
      dashboardApi.recentActivity(6),
    ])
      .then(([s, stats, oot, shipments, activity]) => {
        setSummary(s);
        setStatistics(stats);
        setOrdersOverTime(oot);
        setRecentShipments(shipments);
        setRecentActivity(activity);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} />;
  if (!summary) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Good {timeOfDayGreeting()},</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Welcome back, {user?.name?.split(" ")[0] || "there"}!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here&apos;s what&apos;s happening with your orders and shipments.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Orders"
          value={summary.total_orders}
          icon={<IconOrders />}
          tone="brand"
          trend={summary.total_orders_trend}
        />
        <StatCard
          label="Total Shipments"
          value={summary.total_shipments}
          icon={<IconShipments />}
          tone="slate"
          trend={summary.total_shipments_trend}
        />
        <StatCard
          label="In Transit"
          value={summary.in_transit}
          icon={<IconTruckMoving />}
          tone="sky"
          trend={summary.in_transit_trend}
        />
        <StatCard
          label="Delivered"
          value={summary.delivered}
          icon={<IconPackageCheck />}
          tone="emerald"
          trend={summary.delivered_trend}
        />
        <StatCard
          label="Failed"
          value={summary.failed_deliveries}
          icon={<IconAlertTriangle />}
          tone="red"
          trend={summary.failed_deliveries_trend}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Orders Over Time</h2>
          </CardHeader>
          <CardBody>
            <OrdersOverTimeChart data={ordersOverTime} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipment Status</h2>
          </CardHeader>
          <CardBody>
            <ShipmentStatusChart data={statistics} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Delivery Performance</h2>
        </CardHeader>
        <CardBody>
          <DeliveryPerformanceChart summary={summary} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Shipments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest shipment activity across all orders.</p>
            </div>
            <Link to="/shipments" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all
            </Link>
          </CardHeader>
          {recentShipments.length === 0 ? (
            <CardBody>
              <EmptyState title="No shipments yet" />
            </CardBody>
          ) : (
            <DataTable
              rows={recentShipments}
              rowKey={(row) => row.id}
              columns={[
                {
                  header: "Tracking #",
                  render: (s) => (
                    <Link to={`/shipments/${s.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      {s.tracking_number}
                    </Link>
                  ),
                },
                { header: "Destination", render: (s) => s.destination || "-" },
                { header: "Status", render: (s) => <Badge status={s.status} /> },
                { header: "Date", render: (s) => formatDateTime(s.created_at) },
              ]}
            />
          )}
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Today&apos;s Activity</h2>
          </CardHeader>
          {recentActivity.length === 0 ? (
            <CardBody>
              <EmptyState title="No activity yet" />
            </CardBody>
          ) : (
            <CardBody className="space-y-4">
              {recentActivity.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600 dark:bg-brand-400" />
                    {index < recentActivity.length - 1 && (
                      <span className="w-px flex-1 bg-slate-200 dark:bg-surface-dark-border" />
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.title}</p>
                    <Link
                      to={`/shipments/${event.shipment_id}`}
                      className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      {event.tracking_number}
                    </Link>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(event.event_time)}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}

function timeOfDayGreeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date())
  );
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}
