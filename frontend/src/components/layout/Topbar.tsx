import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconLogout } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-surface-dark-border dark:bg-surface-dark-subtle">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 dark:border-surface-dark-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {initials}
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{user?.role}</span>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <IconLogout className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
