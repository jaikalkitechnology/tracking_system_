import api from "./axios";
import { Address } from "@/types";

export const addressesApi = {
  listForCustomer: (customerId: number) =>
    api.get<Address[]>("/addresses", { params: { customer_id: customerId } }).then((r) => r.data),

  create: (payload: Omit<Address, "id" | "created_at" | "updated_at">) =>
    api.post<Address>("/addresses", payload).then((r) => r.data),
};
