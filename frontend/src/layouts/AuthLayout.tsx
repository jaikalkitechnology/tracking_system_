import { Outlet } from "react-router-dom";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-surface-dark">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                V
              </div>
              <span className="text-2xl font-bold text-brand-700 dark:text-brand-400">Vastraliya</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vastraliya Tracking System</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
