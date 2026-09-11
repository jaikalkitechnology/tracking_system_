import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconBell, IconLogout, IconOrders, IconSettings } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "My Orders", to: "/customer/orders", icon: <IconOrders className="h-4 w-4" /> },
  { label: "Notifications", to: "/customer/notifications", icon: <IconBell className="h-4 w-4" /> },
  { label: "Profile", to: "/customer/profile", icon: <IconSettings className="h-4 w-4" /> },
];

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-surface-dark-border dark:bg-surface-dark-subtle">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            V
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">Vastraliya</span>
        </div>
        <nav className="hidden gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">{user?.name}</span>
          <Button variant="secondary" onClick={handleLogout}>
            <IconLogout className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 dark:border-surface-dark-border dark:bg-surface-dark-subtle sm:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                  : "text-slate-600 dark:text-slate-400"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="mx-auto max-w-5xl p-5">
        <Outlet />
      </main>
    </div>
  );
}
