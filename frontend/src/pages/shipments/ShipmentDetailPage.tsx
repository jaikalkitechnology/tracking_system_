import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { shipmentsApi } from "@/api/shipments";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Input, Label, Select } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/Spinner";
import { Timeline } from "@/components/tracking/Timeline";
import { useAuth } from "@/context/AuthContext";
import { ShipmentDetail } from "@/types";
import { formatDate } from "@/utils/format";

const SHIPMENT_STATUSES = [
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Shipment {shipment.shipment_number}</h1>
        <p className="text-sm text-slate-500">Tracking Number: {shipment.tracking_number}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Shipment Details</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status</span>
              <Badge status={shipment.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Courier</span>
              <span className="font-medium text-slate-800">{shipment.courier?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Warehouse</span>
              <span className="font-medium text-slate-800">{shipment.warehouse?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Origin</span>
              <span className="font-medium text-slate-800">{shipment.origin || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination</span>
              <span className="font-medium text-slate-800">{shipment.destination || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Package Weight</span>
              <span className="font-medium text-slate-800">{shipment.weight ? `${shipment.weight} kg` : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Est. Delivery</span>
              <span className="font-medium text-slate-800">{formatDate(shipment.estimated_delivery_date)}</span>
            </div>
            {shipment.actual_delivery_date && (
              <div className="flex justify-between">
                <span className="text-slate-500">Delivered On</span>
                <span className="font-medium text-slate-800">{formatDate(shipment.actual_delivery_date)}</span>
              </div>
            )}
          </CardBody>

          {isStaff && (
            <CardBody className="border-t border-slate-100">
              <p className="mb-3 text-sm font-semibold text-slate-900">Update Status</p>
              {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <div className="space-y-3">
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
              </div>
            </CardBody>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Tracking Timeline</h2>
          </CardHeader>
          <CardBody>
            <Timeline events={shipment.tracking_events} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
