import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { warehousesApi } from "@/api/warehouses";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { Warehouse } from "@/types";

export function WarehouseDetailPage() {
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    warehousesApi
      .get(Number(id))
      .then(setWarehouse)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!warehouse) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{warehouse.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Code: {warehouse.code}</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Warehouse Information</h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Address</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{warehouse.address || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">City</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{warehouse.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">State</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{warehouse.state}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Pincode</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{warehouse.pincode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <Badge status={warehouse.status} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
