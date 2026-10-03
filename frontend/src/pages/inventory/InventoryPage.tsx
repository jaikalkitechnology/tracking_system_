import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { productsApi } from "@/api/products";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { StatCard } from "@/components/charts/StatCard";
import { IconAlertTriangle, IconClock, IconInventory, IconPackageCheck, IconSearch } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PaginatedResponse, Product } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";

function ProductTile({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  return imageUrl ? (
    <img src={imageUrl} alt={name} className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-surface-dark-border" />
  ) : (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Product[]>([]);

  const load = () => {
    setIsLoading(true);
    setError(null);
    productsApi
      .list({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        category: category || undefined,
        stock_status: stockStatus || undefined,
      })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, debouncedSearch, category, stockStatus]);

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 1 }),
      productsApi.list({ limit: 1, stock_status: "IN_STOCK" }),
      productsApi.list({ limit: 1, stock_status: "LOW_STOCK" }),
      productsApi.list({ limit: 1, stock_status: "OUT_OF_STOCK" }),
    ])
      .then(([all, inStock, low, out]) =>
        setCounts({ total: all.total, inStock: inStock.total, low: low.total, out: out.total })
      )
      .catch(() => setCounts(null));

    productsApi
      .list({ limit: 5, stock_status: "LOW_STOCK" })
      .then((r) => setLowStockItems(r.items))
      .catch(() => setLowStockItems([]));
  }, []);

  useEffect(() => {
    // "Recently Updated Products" is a real, honest substitute for a fabricated activity
    // feed - the backend doesn't log a stock-change audit trail, but it does track updated_at.
    productsApi
      .list({ limit: 5 })
      .then((r) => setRecentlyUpdated([...r.items].sort((a, b) => b.updated_at.localeCompare(a.updated_at))))
      .catch(() => setRecentlyUpdated([]));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Inventory Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track your stock, manage inventory and never run out of products.</p>
      </div>

      {counts && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Products" value={counts.total} icon={<IconInventory />} tone="brand" />
          <StatCard label="In Stock" value={counts.inStock} icon={<IconPackageCheck />} tone="emerald" />
          <StatCard label="Low Stock" value={counts.low} icon={<IconAlertTriangle />} tone="amber" />
          <StatCard label="Out of Stock" value={counts.out} icon={<IconAlertTriangle />} tone="red" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 dark:border-surface-dark-border">
            <div className="relative max-w-xs flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <IconSearch className="h-4 w-4" />
              </span>
              <Input
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
              className="max-w-[160px]"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={stockStatus}
              onChange={(e) => {
                setPage(1);
                setStockStatus(e.target.value);
              }}
              className="max-w-[160px]"
            >
              <option value="">All stock levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </Select>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <div className="p-5">
              <ErrorState message={error} />
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState title="No products found" />
          ) : (
            <>
              <DataTable
                rows={data.items}
                rowKey={(p) => p.id}
                columns={[
                  {
                    header: "Product",
                    render: (p) => (
                      <Link to={`/products/${p.id}`} className="flex items-center gap-3">
                        <ProductTile name={p.name} imageUrl={p.image_url} />
                        <span className="font-medium text-brand-600 dark:text-brand-400">{p.name}</span>
                      </Link>
                    ),
                  },
                  { header: "SKU", render: (p) => p.sku },
                  { header: "Price", render: (p) => formatCurrency(p.price) },
                  { header: "Stock", render: (p) => p.stock_quantity },
                  { header: "Status", render: (p) => <Badge status={p.stock_status} /> },
                ]}
              />
              <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
            </>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Low Stock Products</h2>
            </CardHeader>
            {lowStockItems.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate-400 dark:text-slate-500">Nothing is running low right now.</p>
              </CardBody>
            ) : (
              <CardBody className="space-y-3">
                {lowStockItems.map((p) => (
                  <Link key={p.id} to={`/products/${p.id}`} className="flex items-center gap-3">
                    <ProductTile name={p.name} imageUrl={p.image_url} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">{p.sku}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      {p.stock_quantity} left
                    </span>
                  </Link>
                ))}
              </CardBody>
            )}
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <IconClock className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recently Updated</h2>
            </CardHeader>
            {recentlyUpdated.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate-400 dark:text-slate-500">No products yet.</p>
              </CardBody>
            ) : (
              <CardBody className="space-y-3">
                {recentlyUpdated.map((p) => (
                  <Link key={p.id} to={`/products/${p.id}`} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">{formatDateTime(p.updated_at)}</span>
                    </span>
                  </Link>
                ))}
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
