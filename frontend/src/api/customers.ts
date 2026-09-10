import api from "./axios";
import { Customer, CustomerDetail, PaginatedResponse } from "@/types";

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const customersApi = {
  list: (params: CustomerListParams) =>
    api.get<PaginatedResponse<Customer>>("/customers", { params }).then((r) => r.data),

  get: (id: number) => api.get<CustomerDetail>(`/customers/${id}`).then((r) => r.data),

  create: (payload: { name: string; email: string; phone?: string }) =>
    api.post<Customer>("/customers", payload).then((r) => r.data),

  update: (id: number, payload: Partial<{ name: string; email: string; phone: string; status: string }>) =>
    api.put<Customer>(`/customers/${id}`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/customers/${id}`),
};
