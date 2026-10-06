import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { dashboardApi } from "@/api/dashboard";
import { reportsApi } from "@/api/reports";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { DataTable } from "@/components/tables/DataTable";
import { StatCard } from "@/components/charts/StatCard";
import { SalesOverviewChart } from "@/components/charts/SalesOverviewChart";
import { OrderStatusChart } from "@/components/charts/OrderStatusChart";
import { IconOrders, IconProducts, IconRupee, IconCustomers } from "@/components/ui/icons";
import { Order, OrderStatusBreakdownItem, ReportsSummary, SalesByCategoryItem, SalesOverviewPoint, TopSellingProduct } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";

const DAYS = 7;

export function ReportsPage() {
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [overview, setOverview] = useState<SalesOverviewPoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdownItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategoryItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      reportsApi.summary(DAYS),
      reportsApi.salesOverview(DAYS),
      reportsApi.orderStatusBreakdown(),
      reportsApi.topSellingProducts(30, 5),
      reportsApi.salesByCategory(30),
      dashboardApi.recentOrders(5),
    ])
      .then(([s, ov, status, top, cat, orders]) => {
        setSummary(s);
        setOverview(ov);
        setStatusBreakdown(status);
        setTopProducts(top);
        setSalesByCategory(cat);
        setRecentOrders(orders);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Loading reports..." />;
  if (error) return <ErrorState message={error} />;
  if (!summary) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Reports &amp; Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Get detailed insights about your business performance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Orders" value={summary.total_orders} icon={<IconOrders />} tone="brand" trend={summary.total_orders_trend} />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(summary.total_revenue)}
          icon={<IconRupee />}
          tone="emerald"
          trend={summary.total_revenue_trend}
        />
        <StatCard label="Products Sold" value={summary.products_sold} icon={<IconProducts />} tone="sky" trend={summary.products_sold_trend} />
        <StatCard
          label="New Customers"
          value={summary.new_customers}
          icon={<IconCustomers />}
          tone="amber"
          trend={summary.new_customers_trend}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sales Overview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Orders and revenue over the last {DAYS} days.</p>
          </CardHeader>
          <CardBody>
            <SalesOverviewChart data={overview} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Status</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current status of all orders.</p>
          </CardHeader>
          <CardBody>
            <OrderStatusChart data={statusBreakdown} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top Selling Products</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Last 30 days.</p>
          </CardHeader>
          {topProducts.length === 0 ? (
            <CardBody>
              <EmptyState title="No sales yet" />
            </CardBody>
          ) : (
            <DataTable
              rows={topProducts}
              rowKey={(p) => p.product_id}
              columns={[
                {
                  header: "Product",
                  render: (p) => (
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-surface-dark-border" />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                          {p.name.trim().charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                      <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                    </div>
                  ),
                },
                { header: "Category", render: (p) => p.category || "-" },
                { header: "Sold", render: (p) => p.sold },
                { header: "Revenue", render: (p) => formatCurrency(p.revenue) },
              ]}
            />
          )}
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sales by Category</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Last 30 days.</p>
          </CardHeader>
          {salesByCategory.length === 0 ? (
            <CardBody>
              <EmptyState title="No categorized sales yet" />
            </CardBody>
          ) : (
            <DataTable
              rows={salesByCategory}
              rowKey={(c) => c.category}
              columns={[
                { header: "Category", render: (c) => c.category },
                { header: "Orders", render: (c) => c.orders },
                { header: "Revenue", render: (c) => formatCurrency(c.revenue) },
              ]}
            />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Orders</h2>
          <Link to="/orders" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
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
            rowKey={(o) => o.id}
            columns={[
              {
                header: "Order #",
                render: (o) => (
                  <Link to={`/orders/${o.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                    {o.order_number}
                  </Link>
                ),
              },
              { header: "Amount", render: (o) => formatCurrency(o.total_amount) },
              { header: "Status", render: (o) => <Badge status={o.order_status} /> },
              { header: "Date", render: (o) => formatDateTime(o.created_at) },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
