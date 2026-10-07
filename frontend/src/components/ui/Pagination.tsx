import { Button } from "./Button";
import { Select } from "./Input";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
}

export function Pagination({ page, pages, total, onPageChange, limit, onLimitChange }: PaginationProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 dark:border-surface-dark-border">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page {page} of {pages || 1} &middot; {total} total
      </p>
      <div className="flex items-center gap-3">
        {onLimitChange && (
          <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            Show
            <Select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="w-auto py-1"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button variant="secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
