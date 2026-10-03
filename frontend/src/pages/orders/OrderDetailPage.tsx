import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { ordersApi } from "@/api/orders";
import { shipmentsApi } from "@/api/shipments";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useBasePath } from "@/hooks/useBasePath";
import { OrderDetail, OrderStatus } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PACKED", label: "Packed" },
  { status: "COMPLETED", label: "Completed" },
];

function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="flex items-start">
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center text-center last:flex-none">
            <div className="flex w-full items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                } ${isCurrent ? "ring-4 ring-brand-100 dark:ring-brand-500/20" : ""}`}
              >
                {isDone ? "✓" : index + 1}
              </span>
              {index < STEPS.length - 1 && (
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

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";
  const basePath = useBasePath();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    ordersApi
      .get(Number(id))
      .then(setOrder)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  const handleCreateShipment = async () => {
    if (!order) return;
    setIsCreatingShipment(true);
    try {
      const shipment = await shipmentsApi.create({
        order_id: order.id,
        origin: "Mumbai",
        destination: order.shipping_address?.city || "",
      });
      navigate(`/shipments/${shipment.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsCreatingShipment(false);
    }
  };

  const handleSetStatus = async (order_status: OrderStatus) => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await ordersApi.update(order.id, { order_status });
      setOrder({ ...order, ...updated });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + Number(item.total), 0);
  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING: "CONFIRMED",
    CONFIRMED: "PACKED",
    PACKED: "COMPLETED",
  };
  const advanceTo = nextStatus[order.order_status];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Order {order.order_number}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={order.order_status} />
          <Badge status={order.payment_status} />
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {order.payment_method === "COD" ? "Cash on Delivery" : "Online Payment"}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer Information</h2>
              </CardHeader>
              <CardBody className="space-y-1 text-sm">
                <p className="font-medium text-slate-800 dark:text-slate-200">{order.customer?.name}</p>
                <p className="text-slate-500 dark:text-slate-400">{order.customer?.email}</p>
                <p className="text-slate-500 dark:text-slate-400">{order.customer?.phone}</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipping Address</h2>
              </CardHeader>
              <CardBody className="text-sm text-slate-600 dark:text-slate-300">
                {order.shipping_address ? (
                  <>
                    <p>{order.shipping_address.address_line1}</p>
                    {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500">No shipping address on file.</p>
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between">
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
                        {item.product?.name || `Product #${item.product_id}`}
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
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Billing Address</h2>
            </CardHeader>
            <CardBody className="text-sm text-slate-600 dark:text-slate-300">
              {order.billing_address ? (
                <>
                  <p>{order.billing_address.address_line1}</p>
                  <p>
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.pincode}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 dark:text-slate-500">Same as shipping address.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Progress</h2>
            </CardHeader>
            <CardBody>
              <OrderProgress status={order.order_status} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Summary</h2>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold dark:border-surface-dark-border">
                <span className="text-slate-900 dark:text-slate-50">Total Amount</span>
                <span className="text-slate-900 dark:text-slate-50">{formatCurrency(order.total_amount)}</span>
              </div>
            </CardBody>
          </Card>

          {isStaff && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {advanceTo && (
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled={isUpdatingStatus}
                    onClick={() => handleSetStatus(advanceTo)}
                  >
                    Mark as {advanceTo.charAt(0) + advanceTo.slice(1).toLowerCase()}
                  </Button>
                )}
                <Button className="w-full" onClick={handleCreateShipment} disabled={isCreatingShipment}>
                  {isCreatingShipment ? "Creating shipment..." : "Create Shipment"}
                </Button>
                {order.order_status !== "CANCELLED" && order.order_status !== "COMPLETED" && (
                  <Button
                    className="w-full"
                    variant="danger"
                    disabled={isUpdatingStatus}
                    onClick={() => handleSetStatus("CANCELLED")}
                  >
                    Cancel Order
                  </Button>
                )}
                <Link
                  to={`${basePath}/shipments`}
                  className="block text-center text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  View all shipments
                </Link>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
