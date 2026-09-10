import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/api/axios";
import { customersApi } from "@/api/customers";
import { ordersApi } from "@/api/orders";
import { productsApi } from "@/api/products";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Customer, Product } from "@/types";

interface LineItem {
  product_id: number;
  quantity: number;
}

export function CreateOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [items, setItems] = useState<LineItem[]>([{ product_id: 0, quantity: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    customersApi.list({ page: 1, limit: 100 }).then((r) => setCustomers(r.items));
    productsApi.list({ page: 1, limit: 100, status: "ACTIVE" }).then((r) => setProducts(r.items));
  }, []);

  const updateItem = (index: number, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!customerId) {
      setError("Please select a customer");
      return;
    }
    const validItems = items.filter((item) => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      setError("Add at least one product");
      return;
    }
    setIsSubmitting(true);
    try {
      await ordersApi.create({ customer_id: Number(customerId), items: validItems });
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
      title="Create Order"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Order"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}

        <div>
          <Label>Customer</Label>
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customer_code})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Items</Label>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={item.product_id || ""}
                  onChange={(e) => updateItem(index, { product_id: Number(e.target.value) })}
                  className="flex-1"
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { product_id: 0, quantity: 1 }])}
            className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            + Add another item
          </button>
        </div>
      </div>
    </Modal>
  );
}
