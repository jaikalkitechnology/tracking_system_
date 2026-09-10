export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 py-10 text-center">
      <p className="text-sm font-medium text-red-700">Something went wrong</p>
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}
