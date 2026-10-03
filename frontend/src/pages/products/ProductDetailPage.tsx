import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { productsApi } from "@/api/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input, Label } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

export function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockDraft, setStockDraft] = useState("");
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    productsApi
      .get(Number(id))
      .then((p) => {
        setProduct(p);
        setStockDraft(String(p.stock_quantity));
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  const handleSaveStock = async () => {
    if (!product) return;
    setIsSavingStock(true);
    setStockError(null);
    try {
      const updated = await productsApi.update(product.id, { stock_quantity: Number(stockDraft) || 0 });
      setProduct(updated);
    } catch (err) {
      setStockError(getApiErrorMessage(err));
    } finally {
      setIsSavingStock(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!product) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{product.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={product.status} />
          <Badge status={product.stock_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Product Information</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            {product.description && <p className="text-slate-600 dark:text-slate-300">{product.description}</p>}
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Category</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{product.category || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Price</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(product.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Weight</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{product.weight ? `${product.weight} kg` : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Added</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(product.created_at)}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Inventory</h2>
          </CardHeader>
          <CardBody className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400">In Stock</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{product.stock_quantity}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400">Low Stock Alert</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{product.low_stock_threshold}</p>
              </div>
            </div>
            {isStaff && (
              <div>
                <Label>Update Stock Quantity</Label>
                <div className="flex gap-2">
                  <Input type="number" min={0} value={stockDraft} onChange={(e) => setStockDraft(e.target.value)} />
                  <Button onClick={handleSaveStock} disabled={isSavingStock}>
                    {isSavingStock ? "Saving..." : "Save"}
                  </Button>
                </div>
                {stockError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{stockError}</p>}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
