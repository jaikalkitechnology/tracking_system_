import { Outlet } from "react-router-dom";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconOrders, IconPackageCheck, IconShipments } from "@/components/ui/icons";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-surface-dark">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-sm font-bold backdrop-blur">
            V
          </div>
          <span className="text-xl font-bold">Vastraliya</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Every order, every shipment,
            <br /> tracked end to end.
          </h2>
          <p className="max-w-sm text-sm text-white/70">
            One dashboard for orders, shipments, and courier status — with a live tracking
            timeline your customers can follow too.
          </p>
          <div className="flex gap-6 pt-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <IconOrders className="h-5 w-5" /> Orders
            </div>
            <div className="flex items-center gap-2">
              <IconShipments className="h-5 w-5" /> Shipments
            </div>
            <div className="flex items-center gap-2">
              <IconPackageCheck className="h-5 w-5" /> Delivery
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/50">Vastraliya Tracking System</p>
      </div>

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-sm">
            <div className="mb-6 text-center lg:hidden">
              <span className="text-2xl font-bold text-brand-700 dark:text-brand-400">Vastraliya</span>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vastraliya Tracking System</p>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
