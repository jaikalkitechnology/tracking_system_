import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { productsApi } from "@/api/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { CreateProductModal } from "@/pages/products/CreateProductModal";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PaginatedResponse, Product } from "@/types";
import { formatCurrency } from "@/utils/format";

export function ProductsListPage() {
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setIsLoading(true);
    setError(null);
    productsApi
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
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your product catalog.</p>
        </div>
        {isStaff && <Button onClick={() => setShowCreate(true)}>+ New Product</Button>}
      </div>

      <Card>
        <div className="border-b border-slate-100 p-4 dark:border-surface-dark-border">
          <Input
            placeholder="Search by name or SKU..."
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
                    <Link to={`/products/${p.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      {p.name}
                    </Link>
                  ),
                },
                { header: "SKU", render: (p) => p.sku },
                { header: "Price", render: (p) => formatCurrency(p.price) },
                { header: "Weight", render: (p) => (p.weight ? `${p.weight} kg` : "-") },
                { header: "Status", render: (p) => <Badge status={p.status} /> },
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
