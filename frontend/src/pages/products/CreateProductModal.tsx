import { useState } from "react";

import { getApiErrorMessage } from "@/api/axios";
import { productsApi } from "@/api/products";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function CreateProductModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ sku: "", name: "", description: "", price: "", weight: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!form.sku || !form.name || !form.price) {
      setError("SKU, name and price are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await productsApi.create({
        sku: form.sku,
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        weight: form.weight ? Number(form.weight) : undefined,
      });
      onCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title="New Product"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div>
          <Label>SKU</Label>
          <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" min={0} step="0.01" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
