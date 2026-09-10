import api from "./axios";
import { OrderDetail, Order, PaginatedResponse } from "@/types";

export interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  order_status?: string;
  payment_status?: string;
}

export const ordersApi = {
  list: (params: OrderListParams) => api.get<PaginatedResponse<Order>>("/orders", { params }).then((r) => r.data),

  get: (id: number) => api.get<OrderDetail>(`/orders/${id}`).then((r) => r.data),

  create: (payload: {
    customer_id: number;
    shipping_address_id?: number;
    billing_address_id?: number;
    items: { product_id: number; quantity: number }[];
  }) => api.post<Order>("/orders", payload).then((r) => r.data),

  update: (id: number, payload: Partial<{ payment_status: string; order_status: string }>) =>
    api.put<Order>(`/orders/${id}`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/orders/${id}`),
};
