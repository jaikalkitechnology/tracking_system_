import { NavLink } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import {
  IconCourier,
  IconCustomers,
  IconDashboard,
  IconOrders,
  IconProducts,
  IconBell,
  IconSettings,
  IconShipments,
  IconWarehouse,
} from "@/components/ui/icons";
import { ReactNode } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <IconDashboard /> },
  { label: "Orders", to: "/orders", icon: <IconOrders /> },
  { label: "Shipments", to: "/shipments", icon: <IconShipments /> },
  { label: "Customers", to: "/customers", icon: <IconCustomers />, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Products", to: "/products", icon: <IconProducts /> },
  { label: "Couriers", to: "/couriers", icon: <IconCourier />, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Warehouses", to: "/warehouses", icon: <IconWarehouse />, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Notifications", to: "/notifications", icon: <IconBell /> },
  { label: "Settings", to: "/settings", icon: <IconSettings /> },
];

export function Sidebar() {
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-surface-dark-border dark:bg-surface-dark-subtle md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5 dark:border-surface-dark-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          T
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-slate-50">TrackSuite</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 h-5 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" />}
                <span className={isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"}>
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
