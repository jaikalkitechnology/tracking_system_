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
import { OrderDetail } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";

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

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!order) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Order {order.order_number}</h1>
          <p className="text-sm text-slate-500">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        {isStaff && (
          <Button onClick={handleCreateShipment} disabled={isCreatingShipment}>
            {isCreatingShipment ? "Creating shipment..." : "Create Shipment"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Order Information</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Order Status</span>
              <Badge status={order.order_status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Payment Status</span>
              <Badge status={order.payment_status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</span>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Products</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{item.product?.name || `Product #${item.product_id}`}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="font-medium text-slate-800">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">Customer Information</h2>
            </CardHeader>
            <CardBody className="space-y-1 text-sm">
              <p className="font-medium text-slate-800">{order.customer?.name}</p>
              <p className="text-slate-500">{order.customer?.email}</p>
              <p className="text-slate-500">{order.customer?.phone}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">Shipping Address</h2>
            </CardHeader>
            <CardBody className="text-sm text-slate-600">
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
                <p className="text-slate-400">No shipping address on file.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">Billing Address</h2>
            </CardHeader>
            <CardBody className="text-sm text-slate-600">
              {order.billing_address ? (
                <>
                  <p>{order.billing_address.address_line1}</p>
                  <p>
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.pincode}
                  </p>
                </>
              ) : (
                <p className="text-slate-400">Same as shipping address.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {isStaff && (
        <p className="text-sm text-slate-500">
          Looking for shipment status?{" "}
          <Link to={`${basePath}/shipments`} className="font-medium text-brand-600 hover:underline">
            View all shipments
          </Link>
        </p>
      )}
    </div>
  );
}
