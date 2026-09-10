import api from "./axios";
import { PaginatedResponse, Product } from "@/types";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const productsApi = {
  list: (params: ProductListParams) => api.get<PaginatedResponse<Product>>("/products", { params }).then((r) => r.data),

  get: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (payload: { sku: string; name: string; description?: string; price: number; weight?: number }) =>
    api.post<Product>("/products", payload).then((r) => r.data),

  update: (id: number, payload: Partial<{ name: string; description: string; price: number; weight: number; status: string }>) =>
    api.put<Product>(`/products/${id}`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/products/${id}`),
};
