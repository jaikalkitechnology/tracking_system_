import api from "./axios";
import { PaginatedResponse, User } from "@/types";

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const usersApi = {
  list: (params: UserListParams) => api.get<PaginatedResponse<User>>("/users", { params }).then((r) => r.data),
  update: (id: number, payload: Partial<{ name: string; phone: string; role: string; status: string }>) =>
    api.put<User>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/users/${id}`),
};
