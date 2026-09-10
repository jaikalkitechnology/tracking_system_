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
import { DashboardSummary, Order, Shipment } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statistics, setStatistics] = useState<ShipmentStatistic[]>([]);
  const [ordersOverTime, setOrdersOverTime] = useState<OrdersOverTimePoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.shipmentStatistics(),
      dashboardApi.ordersOverTime(),
      dashboardApi.recentOrders(5),
      dashboardApi.recentShipments(5),
    ])
      .then(([s, stats, oot, orders, shipments]) => {
        setSummary(s);
        setStatistics(stats);
        setOrdersOverTime(oot);
        setRecentOrders(orders);
        setRecentShipments(shipments);
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
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of orders and shipments across your business.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Orders" value={summary.total_orders} />
        <StatCard label="Total Shipments" value={summary.total_shipments} />
        <StatCard label="In Transit" value={summary.in_transit} accent="text-sky-600" />
        <StatCard label="Delivered" value={summary.delivered} accent="text-green-600" />
        <StatCard label="Failed" value={summary.failed_deliveries} accent="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Shipment Status</h2>
          </CardHeader>
          <CardBody>
            <ShipmentStatusChart data={statistics} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Orders Over Time</h2>
          </CardHeader>
          <CardBody>
            <OrdersOverTimeChart data={ordersOverTime} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Delivery Performance</h2>
        </CardHeader>
        <CardBody>
          <DeliveryPerformanceChart summary={summary} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            <Link to="/orders" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          {recentOrders.length === 0 ? (
            <CardBody>
              <EmptyState title="No orders yet" />
            </CardBody>
          ) : (
            <DataTable
              rows={recentOrders}
              rowKey={(row) => row.id}
              columns={[
                { header: "Order #", render: (o) => <Link to={`/orders/${o.id}`} className="font-medium text-brand-600">{o.order_number}</Link> },
                { header: "Amount", render: (o) => formatCurrency(o.total_amount) },
                { header: "Status", render: (o) => <Badge status={o.order_status} /> },
                { header: "Date", render: (o) => formatDate(o.created_at) },
              ]}
            />
          )}
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Shipments</h2>
            <Link to="/shipments" className="text-xs font-medium text-brand-600 hover:underline">
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
                { header: "Tracking #", render: (s) => <Link to={`/shipments/${s.id}`} className="font-medium text-brand-600">{s.tracking_number}</Link> },
                { header: "Status", render: (s) => <Badge status={s.status} /> },
                { header: "Date", render: (s) => formatDate(s.created_at) },
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
