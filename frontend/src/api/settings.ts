import api from "./axios";
import { StoreSettings } from "@/types";

export const settingsApi = {
  get: () => api.get<StoreSettings>("/settings").then((r) => r.data),
  update: (payload: Partial<Omit<StoreSettings, "updated_at">>) =>
    api.put<StoreSettings>("/settings", payload).then((r) => r.data),
};
