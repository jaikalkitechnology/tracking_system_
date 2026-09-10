import { Navigate, Outlet } from "react-router-dom";

import { LoadingState } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingState label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "CUSTOMER" ? "/customer/orders" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
