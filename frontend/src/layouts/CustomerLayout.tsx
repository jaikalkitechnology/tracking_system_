import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "My Orders", to: "/customer/orders" },
  { label: "Notifications", to: "/customer/notifications" },
  { label: "Profile", to: "/customer/profile" },
];

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
        <span className="text-lg font-bold text-brand-700">TrackSuite</span>
        <nav className="hidden gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{user?.name}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 sm:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? "bg-brand-50 text-brand-700" : "text-slate-600"
              }`
            }
          >
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
