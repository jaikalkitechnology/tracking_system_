import api from "./axios";
import { PublicTracking } from "@/types";

export const trackingApi = {
  track: (trackingNumber: string) =>
    api.get<PublicTracking>(`/track/${encodeURIComponent(trackingNumber)}`).then((r) => r.data),
};
