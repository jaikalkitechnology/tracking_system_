import { useState } from "react";

import { addressesApi } from "@/api/addresses";
import { getApiErrorMessage } from "@/api/axios";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function AddAddressModal({
  customerId,
  onClose,
  onCreated,
}: {
  customerId: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!form.address_line1 || !form.city || !form.state || !form.pincode) {
      setError("Address line 1, city, state and pincode are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await addressesApi.create({
        customer_id: customerId,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
        latitude: null,
        longitude: null,
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
      title="Add Address"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Address"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
        <div>
          <Label>Address Line 1</Label>
          <Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
        </div>
        <div>
          <Label>Address Line 2 (optional)</Label>
          <Input value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Pincode</Label>
            <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
          <div>
            <Label>Country</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
