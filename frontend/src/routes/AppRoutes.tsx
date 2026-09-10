import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { PublicTrackingPage } from "@/pages/tracking/PublicTrackingPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { OrdersListPage } from "@/pages/orders/OrdersListPage";
import { OrderDetailPage } from "@/pages/orders/OrderDetailPage";
import { ShipmentsListPage } from "@/pages/shipments/ShipmentsListPage";
import { ShipmentDetailPage } from "@/pages/shipments/ShipmentDetailPage";
import { CustomersListPage } from "@/pages/customers/CustomersListPage";
import { CustomerDetailPage } from "@/pages/customers/CustomerDetailPage";
import { ProductsListPage } from "@/pages/products/ProductsListPage";
import { ProductDetailPage } from "@/pages/products/ProductDetailPage";
import { CouriersListPage } from "@/pages/couriers/CouriersListPage";
import { CourierDetailPage } from "@/pages/couriers/CourierDetailPage";
import { WarehousesListPage } from "@/pages/warehouses/WarehousesListPage";
import { WarehouseDetailPage } from "@/pages/warehouses/WarehouseDetailPage";
import { NotificationsPage } from "@/pages/notifications/NotificationsPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { CustomerOrdersPage } from "@/pages/customer/CustomerOrdersPage";
import { CustomerOrderDetailPage } from "@/pages/customer/CustomerOrderDetailPage";
import { CustomerShipmentDetailPage } from "@/pages/customer/CustomerShipmentDetailPage";
import { CustomerNotificationsPage } from "@/pages/customer/CustomerNotificationsPage";
import { CustomerProfilePage } from "@/pages/customer/CustomerProfilePage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] as const;

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/track" element={<PublicTrackingPage />} />
      <Route path="/" element={<Navigate to="/track" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[...STAFF_ROLES]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersListPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/shipments" element={<ShipmentsListPage />} />
          <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
          <Route path="/customers" element={<CustomersListPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/products" element={<ProductsListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/couriers" element={<CouriersListPage />} />
          <Route path="/couriers/:id" element={<CourierDetailPage />} />
          <Route path="/warehouses" element={<WarehousesListPage />} />
          <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer/orders" element={<CustomerOrdersPage />} />
          <Route path="/customer/orders/:id" element={<CustomerOrderDetailPage />} />
          <Route path="/customer/shipments/:id" element={<CustomerShipmentDetailPage />} />
          <Route path="/customer/notifications" element={<CustomerNotificationsPage />} />
          <Route path="/customer/profile" element={<CustomerProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/track" replace />} />
    </Routes>
  );
}
