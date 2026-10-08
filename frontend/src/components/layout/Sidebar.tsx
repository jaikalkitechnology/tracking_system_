import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import {
  IconCustomers,
  IconDashboard,
  IconInventory,
  IconOrders,
  IconProducts,
  IconReports,
  IconSettings,
  IconShipments,
  IconX,
} from "@/components/ui/icons";
import vastraliyaLogo from "@/assets/vastraliya-logo.webp";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <IconDashboard /> },
  { label: "Reports", to: "/reports", icon: <IconReports />, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { label: "Orders", to: "/orders", icon: <IconOrders /> },
  { label: "Shipments", to: "/shipments", icon: <IconShipments /> },
  { label: "Customers", to: "/customers", icon: <IconCustomers />, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Products", to: "/products", icon: <IconProducts /> },
  { label: "Inventory", to: "/inventory", icon: <IconInventory />, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Settings", to: "/settings", icon: <IconSettings /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-surface-dark-border dark:bg-surface-dark-subtle md:static md:z-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center justify-center gap-2 border-b border-slate-100 px-5 dark:border-surface-dark-border">
          <img src={vastraliyaLogo} alt="Vastraliya Tracking System" className="h-20 w-auto rounded-lg bg-white p-1" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200 md:hidden"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
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
    </>
  );
}
