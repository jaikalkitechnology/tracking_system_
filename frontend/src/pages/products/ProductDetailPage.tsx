import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { productsApi } from "@/api/products";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { Product } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    productsApi
      .get(Number(id))
      .then(setProduct)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!product) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{product.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Product Information</h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          {product.description && <p className="text-slate-600 dark:text-slate-300">{product.description}</p>}
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Price</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(product.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Weight</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{product.weight ? `${product.weight} kg` : "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <Badge status={product.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Added</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(product.created_at)}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
