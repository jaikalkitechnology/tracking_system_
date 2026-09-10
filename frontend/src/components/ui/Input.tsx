import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, forwardRef } from "react";

const FIELD_CLASSES =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-surface-dark-border dark:bg-surface-dark dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${FIELD_CLASSES} ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${FIELD_CLASSES} ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{children}</label>;
}
