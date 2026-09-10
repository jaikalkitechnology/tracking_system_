import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { warehousesApi } from "@/api/warehouses";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { CreateWarehouseModal } from "@/pages/warehouses/CreateWarehouseModal";
import { PaginatedResponse, Warehouse } from "@/types";

export function WarehousesListPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Warehouse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setIsLoading(true);
    setError(null);
    warehousesApi
      .list({ page, limit: 10 })
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Warehouses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage fulfillment locations.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Warehouse</Button>
      </div>

      <Card>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="p-5">
            <ErrorState message={error} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No warehouses found" />
        ) : (
          <>
            <DataTable
              rows={data.items}
              rowKey={(w) => w.id}
              columns={[
                {
                  header: "Name",
                  render: (w) => (
                    <Link to={`/warehouses/${w.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      {w.name}
                    </Link>
                  ),
                },
                { header: "Code", render: (w) => w.code },
                { header: "City", render: (w) => w.city },
                { header: "State", render: (w) => w.state },
                { header: "Status", render: (w) => <Badge status={w.status} /> },
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showCreate && (
        <CreateWarehouseModal
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
