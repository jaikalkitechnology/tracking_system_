import { useAuth } from "@/context/AuthContext";

/** Customers are routed under /customer/*, staff use the bare paths. */
export function useBasePath(): string {
  const { user } = useAuth();
  return user?.role === "CUSTOMER" ? "/customer" : "";
}
