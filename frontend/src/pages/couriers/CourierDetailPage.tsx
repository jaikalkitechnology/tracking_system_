import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { couriersApi } from "@/api/couriers";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { Courier } from "@/types";

export function CourierDetailPage() {
  const { id } = useParams();
  const [courier, setCourier] = useState<Courier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    couriersApi
      .get(Number(id))
      .then(setCourier)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!courier) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{courier.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Code: {courier.code}</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Courier Information</h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Phone</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{courier.phone || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Email</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{courier.email || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">API URL</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{courier.api_url || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <Badge status={courier.status} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
