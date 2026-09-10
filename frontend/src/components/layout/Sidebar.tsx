import { NavLink } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

interface NavItem {
  label: string;
  to: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Orders", to: "/orders" },
  { label: "Shipments", to: "/shipments" },
  { label: "Customers", to: "/customers", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Products", to: "/products" },
  { label: "Couriers", to: "/couriers", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Warehouses", to: "/warehouses", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Notifications", to: "/notifications" },
  { label: "Settings", to: "/settings" },
];

export function Sidebar() {
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <span className="text-lg font-bold text-brand-700">TrackSuite</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
