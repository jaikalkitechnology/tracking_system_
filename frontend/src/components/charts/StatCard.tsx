import { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  tone?: "brand" | "sky" | "emerald" | "red" | "slate" | "amber";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  red: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
};

export function StatCard({ label, value, icon, tone = "slate" }: StatCardProps) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
        </div>
      </div>
    </Card>
  );
}
