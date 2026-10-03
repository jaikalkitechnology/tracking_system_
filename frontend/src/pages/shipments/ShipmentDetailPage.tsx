import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { shipmentsApi } from "@/api/shipments";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { IconMapPin } from "@/components/ui/icons";
import { Input, Label, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Timeline } from "@/components/tracking/Timeline";
import { useAuth } from "@/context/AuthContext";
import { ShipmentDetail, ShipmentStatus } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "ORDER_CONFIRMED",
  "PACKED",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_AT_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "RTO",
  "ON_HOLD",
];

const PROGRESS_STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: "ORDER_CONFIRMED", label: "Order Confirmed" },
  { status: "PACKED", label: "Packed" },
  { status: "PICKED_UP", label: "Picked Up" },
  { status: "IN_TRANSIT", label: "In Transit" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

// Statuses not directly in PROGRESS_STEPS map onto the nearest equivalent step for the visual tracker.
const STEP_ALIAS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  READY_FOR_PICKUP: "PACKED",
  ARRIVED_AT_HUB: "IN_TRANSIT",
};

const HALT_STATUSES = new Set<ShipmentStatus>([
  "CANCELLED",
  "DELIVERY_FAILED",
  "RETURN_REQUESTED",
  "RETURNED",
  "RTO",
  "ON_HOLD",
]);

function ShipmentProgress({ status }: { status: ShipmentStatus }) {
  if (HALT_STATUSES.has(status)) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
        This shipment is {status.replace(/_/g, " ").toLowerCase()}.
      </div>
    );
  }

  const effective = STEP_ALIAS[status] || status;
  const currentIndex = PROGRESS_STEPS.findIndex((s) => s.status === effective);

  return (
    <ol className="flex items-start">
      {PROGRESS_STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center text-center last:flex-none">
            <div className="flex w-full items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                } ${isCurrent ? "ring-4 ring-brand-100 dark:ring-brand-500/20" : ""}`}
              >
                {isDone ? "✓" : index + 1}
              </span>
              {index < PROGRESS_STEPS.length - 1 && (
                <span className={`mx-1 h-0.5 flex-1 ${isDone && index < currentIndex ? "bg-brand-600" : "bg-slate-200 dark:bg-white/10"}`} />
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${isDone ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function RouteVisual({ origin, destination, status }: { origin: string | null; destination: string | null; status: ShipmentStatus }) {
  const effective = STEP_ALIAS[status] || status;
  const currentIndex = Math.max(PROGRESS_STEPS.findIndex((s) => s.status === effective), 0);
  const progressPercent = HALT_STATUSES.has(status) ? 0 : (currentIndex / (PROGRESS_STEPS.length - 1)) * 100;

  return (
    <div className="px-2 py-6">
      <div className="relative h-1.5 rounded-full bg-slate-200 dark:bg-white/10">
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand-600 transition-all" style={{ width: `${progressPercent}%` }} />
        <span
          className="absolute -top-2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-brand-600 shadow dark:border-surface-dark-subtle"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-3 flex items-start justify-between text-sm">
        <div className="flex items-start gap-1.5">
          <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{origin || "Origin"}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Pickup point</p>
          </div>
        </div>
        <div className="flex items-start gap-1.5 text-right">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{destination || "Destination"}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Delivery point</p>
          </div>
          <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        </div>
      </div>
    </div>
  );
}

export function ShipmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";

  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nextStatus, setNextStatus] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    shipmentsApi
      .get(Number(id))
      .then(setShipment)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  const handleUpdateStatus = async () => {
    if (!shipment || !nextStatus) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await shipmentsApi.updateStatus(shipment.id, {
        status: nextStatus,
        location: location || undefined,
        description: description || undefined,
      });
      setShipment(updated);
      setNextStatus("");
      setLocation("");
      setDescription("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error && !shipment) return <ErrorState message={error} />;
  if (!shipment) return null;

  const order = shipment.order;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Shipment {shipment.shipment_number}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tracking Number: <span className="font-mono">{shipment.tracking_number}</span>
            {order && (
              <>
                {" "}
                &middot; Order{" "}
                <Link to={`/orders/${order.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {order.order_number}
                </Link>
              </>
            )}
          </p>
        </div>
        <Badge status={shipment.status} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipment Progress</h2>
        </CardHeader>
        <CardBody>
          <ShipmentProgress status={shipment.status} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipment Information</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Courier</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{shipment.courier?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Warehouse</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{shipment.warehouse?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Package Weight</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{shipment.weight ? `${shipment.weight} kg` : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Est. Delivery</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(shipment.estimated_delivery_date)}</span>
            </div>
            {shipment.actual_delivery_date && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Delivered On</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(shipment.actual_delivery_date)}</span>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Route</h2>
          </CardHeader>
          <RouteVisual origin={shipment.origin} destination={shipment.destination} status={shipment.status} />
        </Card>
      </div>

      {order && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Items</h2>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-surface-dark-border dark:bg-white/5 dark:text-slate-400">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 last:border-0 dark:border-surface-dark-border/60">
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                          {item.product?.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-surface-dark-border"
                            />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                              {(item.product?.name || "?").trim().charAt(0).toUpperCase() || "?"}
                            </span>
                          )}
                          <span>{item.product?.name || `Product #${item.product_id}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{formatCurrency(item.price)}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{item.quantity}</td>
                      <td className="px-5 py-3 text-right font-medium text-slate-800 dark:text-slate-200">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment Summary</h2>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(order.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(order.shipping_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Discount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Tax</span>
                  <span className="text-slate-700 dark:text-slate-300">{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold dark:border-surface-dark-border">
                <span className="text-slate-900 dark:text-slate-50">Total Paid</span>
                <span className="text-slate-900 dark:text-slate-50">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 dark:text-slate-400">{order.payment_method === "COD" ? "Cash on Delivery" : "Online Payment"}</span>
                <Badge status={order.payment_status} />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tracking Timeline</h2>
          </CardHeader>
          <CardBody>
            <Timeline events={shipment.tracking_events} />
          </CardBody>
        </Card>

        {isStaff && (
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Update Status</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
              <div>
                <Label>New Status</Label>
                <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                  <option value="">Select status</option>
                  {SHIPMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Thane Hub" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" />
              </div>
              <Button className="w-full" disabled={!nextStatus || isUpdating} onClick={handleUpdateStatus}>
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
