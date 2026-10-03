import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { productsApi } from "@/api/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { StatCard } from "@/components/charts/StatCard";
import { IconAlertTriangle, IconPackageCheck, IconProducts, IconSearch } from "@/components/ui/icons";
import { CreateProductModal } from "@/pages/products/CreateProductModal";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PaginatedResponse, Product } from "@/types";
import { formatCurrency } from "@/utils/format";

const TILE_TONES = [
  "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
];

function toneFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % TILE_TONES.length;
  return TILE_TONES[hash];
}

function ProductTile({ name }: { name: string }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${toneFor(name)}`}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function ProductsListPage() {
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    productsApi
      .list({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: status || undefined,
        category: category || undefined,
        stock_status: stockStatus || undefined,
      })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, debouncedSearch, status, category, stockStatus]);

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 1 }),
      productsApi.list({ limit: 1, status: "ACTIVE" }),
      productsApi.list({ limit: 1, stock_status: "LOW_STOCK" }),
      productsApi.list({ limit: 1, stock_status: "OUT_OF_STOCK" }),
    ])
      .then(([all, active, low, out]) =>
        setCounts({ total: all.total, active: active.total, low: low.total, out: out.total })
      )
      .catch(() => setCounts(null));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your product catalog, stock and details.</p>
        </div>
        {isStaff && <Button onClick={() => setShowCreate(true)}>+ New Product</Button>}
      </div>

      {counts && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Products" value={counts.total} icon={<IconProducts />} tone="brand" />
          <StatCard label="Active Products" value={counts.active} icon={<IconPackageCheck />} tone="emerald" />
          <StatCard label="Low Stock" value={counts.low} icon={<IconAlertTriangle />} tone="amber" />
          <StatCard label="Out of Stock" value={counts.out} icon={<IconAlertTriangle />} tone="red" />
        </div>
      )}

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 dark:border-surface-dark-border">
          <div className="relative max-w-xs flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <IconSearch className="h-4 w-4" />
            </span>
            <Input
              placeholder="Search by name or SKU..."
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
            className="max-w-[180px]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="max-w-[160px]"
          >
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DISCONTINUED">Discontinued</option>
          </Select>
          <Select
            value={stockStatus}
            onChange={(e) => {
              setPage(1);
              setStockStatus(e.target.value);
            }}
            className="max-w-[180px]"
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
                      <ProductTile name={p.name} />
                      <span>
                        <span className="block font-medium text-brand-600 dark:text-brand-400">{p.name}</span>
                        {p.description && (
                          <span className="block max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                            {p.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  ),
                },
                { header: "SKU", render: (p) => p.sku },
                {
                  header: "Category",
                  render: (p) =>
                    p.category ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {p.category}
                      </span>
                    ) : (
                      "-"
                    ),
                },
                { header: "Price", render: (p) => formatCurrency(p.price) },
                { header: "Stock", render: (p) => p.stock_quantity },
                { header: "Status", render: (p) => <Badge status={p.stock_status} /> },
                {
                  header: "Actions",
                  render: (p) => (
                    <Link
                      to={`/products/${p.id}`}
                      className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-surface-dark-border dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      Edit
                    </Link>
                  ),
                },
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showCreate && (
        <CreateProductModal
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
