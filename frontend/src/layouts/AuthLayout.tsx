import { Outlet } from "react-router-dom";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import vastraliyaLogo from "@/assets/vastraliya-logo.webp";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-surface-dark">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <img src={vastraliyaLogo} alt="Vastraliya Tracking System" className="h-28 w-auto rounded-xl bg-white p-2 shadow-card dark:shadow-card-dark" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
