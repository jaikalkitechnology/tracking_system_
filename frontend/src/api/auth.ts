import api from "./axios";
import { User } from "@/types";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/login", { email, password }).then((r) => r.data),

  register: (payload: { name: string; email: string; phone?: string; password: string }) =>
    api.post<TokenResponse>("/auth/register", payload).then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),

  logout: () => api.post("/auth/logout"),
};
