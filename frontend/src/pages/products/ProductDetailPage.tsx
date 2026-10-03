import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { ProductPayload, productsApi } from "@/api/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { IconX } from "@/components/ui/icons";
import { Input, Label, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { Product, ProductStatus } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

type Tab = "basic" | "images" | "specs";

type Draft = ProductPayload & { status: ProductStatus };

function toDraft(p: Product): Draft {
  return {
    sku: p.sku,
    name: p.name,
    description: p.description || "",
    category: p.category || "",
    brand: p.brand || "",
    image_url: p.image_url || "",
    barcode: p.barcode || "",
    tags: p.tags || "",
    price: p.price,
    compare_price: p.compare_price ?? undefined,
    cost_price: p.cost_price ?? undefined,
    weight: p.weight ?? undefined,
    length_cm: p.length_cm ?? undefined,
    width_cm: p.width_cm ?? undefined,
    height_cm: p.height_cm ?? undefined,
    stock_quantity: p.stock_quantity,
    low_stock_threshold: p.low_stock_threshold,
    status: p.status,
  };
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";

  const [product, setProduct] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [tab, setTab] = useState<Tab>("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    productsApi
      .get(Number(id))
      .then((p) => {
        setProduct(p);
        setDraft(toDraft(p));
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!product || !draft) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await productsApi.update(product.id, draft);
      setProduct(updated);
      setDraft(toDraft(updated));
      setSaved(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!product || !newImageUrl.trim()) return;
    try {
      await productsApi.addImage(product.id, { url: newImageUrl.trim(), position: product.images.length });
      setNewImageUrl("");
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    if (!product) return;
    try {
      await productsApi.removeImage(product.id, imageId);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <LoadingState />;
  if (error && !product) return <ErrorState message={error} />;
  if (!product || !draft) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Edit Product</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Update product details, pricing, inventory and other information.</p>
        </div>
        {isStaff && (
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved</span>}
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Product"}
            </Button>
          </div>
        )}
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="flex gap-1 border-b border-slate-100 px-3 pt-2 dark:border-surface-dark-border">
              {([
                { key: "basic", label: "Basic Information" },
                { key: "images", label: "Images & Media" },
                { key: "specs", label: "Specifications" },
              ] as { key: Tab; label: string }[]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "basic" && (
              <CardBody className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Product Name</Label>
                    <Input value={draft.name} onChange={(e) => set("name", e.target.value)} disabled={!isStaff} />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input value={draft.sku} onChange={(e) => set("sku", e.target.value)} disabled={!isStaff} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Input value={draft.category || ""} onChange={(e) => set("category", e.target.value)} disabled={!isStaff} />
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <Input value={draft.brand || ""} onChange={(e) => set("brand", e.target.value)} disabled={!isStaff} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-surface-dark-border dark:bg-surface-dark dark:text-slate-100"
                    rows={5}
                    value={draft.description || ""}
                    onChange={(e) => set("description", e.target.value)}
                    disabled={!isStaff}
                  />
                </div>
              </CardBody>
            )}

            {tab === "images" && (
              <CardBody className="space-y-4">
                <div>
                  <Label>Primary Image URL</Label>
                  <Input value={draft.image_url || ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." disabled={!isStaff} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Gallery Images
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {product.images.map((img) => (
                      <div key={img.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 dark:border-surface-dark-border">
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        {isStaff && (
                          <button
                            onClick={() => handleRemoveImage(img.id)}
                            className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <IconX className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isStaff && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Add another image URL..."
                        className="max-w-sm"
                      />
                      <Button variant="secondary" onClick={handleAddImage} disabled={!newImageUrl.trim()}>
                        Add Image
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            )}

            {tab === "specs" && (
              <CardBody className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={draft.weight ?? ""}
                      onChange={(e) => set("weight", e.target.value ? Number(e.target.value) : undefined)}
                      disabled={!isStaff}
                    />
                  </div>
                  <div>
                    <Label>Barcode</Label>
                    <Input value={draft.barcode || ""} onChange={(e) => set("barcode", e.target.value)} disabled={!isStaff} />
                  </div>
                </div>
                <div>
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Length"
                      value={draft.length_cm ?? ""}
                      onChange={(e) => set("length_cm", e.target.value ? Number(e.target.value) : undefined)}
                      disabled={!isStaff}
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Width"
                      value={draft.width_cm ?? ""}
                      onChange={(e) => set("width_cm", e.target.value ? Number(e.target.value) : undefined)}
                      disabled={!isStaff}
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Height"
                      value={draft.height_cm ?? ""}
                      onChange={(e) => set("height_cm", e.target.value ? Number(e.target.value) : undefined)}
                      disabled={!isStaff}
                    />
                  </div>
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input value={draft.tags || ""} onChange={(e) => set("tags", e.target.value)} placeholder="e.g. summer, cotton, bestseller" disabled={!isStaff} />
                </div>
              </CardBody>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pricing & Stock</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Selling Price (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.price}
                    onChange={(e) => set("price", Number(e.target.value) || 0)}
                    disabled={!isStaff}
                  />
                </div>
                <div>
                  <Label>Compare Price (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.compare_price ?? ""}
                    onChange={(e) => set("compare_price", e.target.value ? Number(e.target.value) : undefined)}
                    disabled={!isStaff}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cost Price (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.cost_price ?? ""}
                    onChange={(e) => set("cost_price", e.target.value ? Number(e.target.value) : undefined)}
                    disabled={!isStaff}
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.stock_quantity}
                    onChange={(e) => set("stock_quantity", Number(e.target.value) || 0)}
                    disabled={!isStaff}
                  />
                </div>
              </div>
              <div>
                <Label>Low Stock Alert</Label>
                <Input
                  type="number"
                  min={0}
                  value={draft.low_stock_threshold}
                  onChange={(e) => set("low_stock_threshold", Number(e.target.value) || 0)}
                  disabled={!isStaff}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Product Status</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <Label>Status</Label>
                <Select value={draft.status} onChange={(e) => set("status", e.target.value as ProductStatus)} disabled={!isStaff}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Badge status={product.status} />
                <Badge status={product.stock_status} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Current price: {formatCurrency(product.price)} &middot; Added {formatDate(product.created_at)}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
