import api from "./axios";
import { PaginatedResponse, Shipment, ShipmentDetail } from "@/types";

export interface ShipmentListParams {
  page?: number;
  limit?: number;
  tracking_number?: string;
  order_number?: string;
  status?: string;
  courier_id?: number;
  warehouse_id?: number;
}

export const shipmentsApi = {
  list: (params: ShipmentListParams) => api.get<PaginatedResponse<Shipment>>("/shipments", { params }).then((r) => r.data),

  get: (id: number) => api.get<ShipmentDetail>(`/shipments/${id}`).then((r) => r.data),

  create: (payload: {
    order_id: number;
    courier_id?: number;
    warehouse_id?: number;
    weight?: number;
    shipping_cost?: number;
    estimated_delivery_date?: string;
    origin?: string;
    destination?: string;
  }) => api.post<Shipment>("/shipments", payload).then((r) => r.data),

  updateStatus: (
    id: number,
    payload: { status: string; title?: string; description?: string; location?: string }
  ) => api.post<ShipmentDetail>(`/shipments/${id}/status`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/shipments/${id}`),
};
