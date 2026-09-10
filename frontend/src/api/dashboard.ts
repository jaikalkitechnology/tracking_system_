import api from "./axios";
import { DashboardSummary, Order, Shipment } from "@/types";

export interface ShipmentStatistic {
  status: string;
  count: number;
}

export interface OrdersOverTimePoint {
  date: string;
  count: number;
}

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary").then((r) => r.data),
  shipmentStatistics: () => api.get<ShipmentStatistic[]>("/dashboard/shipment-statistics").then((r) => r.data),
  ordersOverTime: (days = 14) =>
    api.get<OrdersOverTimePoint[]>("/dashboard/orders-over-time", { params: { days } }).then((r) => r.data),
  recentOrders: (limit = 10) => api.get<Order[]>("/dashboard/recent-orders", { params: { limit } }).then((r) => r.data),
  recentShipments: (limit = 10) =>
    api.get<Shipment[]>("/dashboard/recent-shipments", { params: { limit } }).then((r) => r.data),
};
