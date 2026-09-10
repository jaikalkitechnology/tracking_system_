import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { couriersApi } from "@/api/couriers";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/tables/DataTable";
import { CreateCourierModal } from "@/pages/couriers/CreateCourierModal";
import { PaginatedResponse, Courier } from "@/types";

export function CouriersListPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Courier> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setIsLoading(true);
    setError(null);
    couriersApi
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
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Couriers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage delivery partners. API keys are never exposed here.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Courier</Button>
      </div>

      <Card>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="p-5">
            <ErrorState message={error} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No couriers found" />
        ) : (
          <>
            <DataTable
              rows={data.items}
              rowKey={(c) => c.id}
              columns={[
                {
                  header: "Name",
                  render: (c) => (
                    <Link to={`/couriers/${c.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      {c.name}
                    </Link>
                  ),
                },
                { header: "Code", render: (c) => c.code },
                { header: "Phone", render: (c) => c.phone || "-" },
                { header: "Email", render: (c) => c.email || "-" },
                { header: "Status", render: (c) => <Badge status={c.status} /> },
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      {showCreate && (
        <CreateCourierModal
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
