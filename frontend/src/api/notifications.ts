import api from "./axios";
import { Notification, PaginatedResponse } from "@/types";

export interface NotificationListParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
}

export const notificationsApi = {
  list: (params: NotificationListParams) =>
    api.get<PaginatedResponse<Notification>>("/notifications", { params }).then((r) => r.data),

  markRead: (id: number) => api.put<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => api.put("/notifications/read-all"),
};
