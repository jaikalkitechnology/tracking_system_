import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconLogout, IconMenu } from "@/components/ui/icons";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
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
    <header className="flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 dark:border-surface-dark-border dark:bg-surface-dark-subtle sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 md:hidden"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <div className="truncate text-sm text-slate-500 dark:text-slate-400">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <NotificationBell />
        <ThemeToggle />
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 dark:border-surface-dark-border sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {initials}
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{user?.role}</span>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <IconLogout className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
