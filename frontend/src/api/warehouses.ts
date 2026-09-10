import api from "./axios";
import { PaginatedResponse, Warehouse } from "@/types";

export interface WarehouseListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const warehousesApi = {
  list: (params: WarehouseListParams) => api.get<PaginatedResponse<Warehouse>>("/warehouses", { params }).then((r) => r.data),

  get: (id: number) => api.get<Warehouse>(`/warehouses/${id}`).then((r) => r.data),

  create: (payload: { name: string; code: string; address?: string; city: string; state: string; pincode: string }) =>
    api.post<Warehouse>("/warehouses", payload).then((r) => r.data),

  update: (id: number, payload: Partial<{ name: string; address: string; city: string; state: string; pincode: string; status: string }>) =>
    api.put<Warehouse>(`/warehouses/${id}`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/warehouses/${id}`),
};
