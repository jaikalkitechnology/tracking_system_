import api from "./axios";
import { Courier, PaginatedResponse } from "@/types";

export interface CourierListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const couriersApi = {
  list: (params: CourierListParams) => api.get<PaginatedResponse<Courier>>("/couriers", { params }).then((r) => r.data),

  get: (id: number) => api.get<Courier>(`/couriers/${id}`).then((r) => r.data),

  create: (payload: { name: string; code: string; phone?: string; email?: string; api_url?: string; api_key?: string }) =>
    api.post<Courier>("/couriers", payload).then((r) => r.data),

  update: (id: number, payload: Partial<{ name: string; phone: string; email: string; api_url: string; api_key: string; status: string }>) =>
    api.put<Courier>(`/couriers/${id}`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/couriers/${id}`),
};
