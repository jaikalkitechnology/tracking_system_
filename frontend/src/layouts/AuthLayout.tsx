import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold text-brand-700">TrackSuite</span>
          <p className="mt-1 text-sm text-slate-500">E-Commerce Tracking System</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
