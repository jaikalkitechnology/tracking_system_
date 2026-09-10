import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { trackingApi } from "@/api/tracking";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconSearch } from "@/components/ui/icons";
import { Timeline } from "@/components/tracking/Timeline";
import { PublicTracking } from "@/types";
import { formatDate } from "@/utils/format";

export function PublicTrackingPage() {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("tracking_number") || "");
  const [result, setResult] = useState<PublicTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSearch = async (value: string) => {
    if (!value.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await trackingApi.track(value.trim());
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSearch(trackingNumber);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50 px-4 py-10 dark:from-surface-dark dark:via-surface-dark dark:to-surface-dark">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-500/10" />

      <div className="relative mx-auto max-w-2xl">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-brand-700 dark:text-brand-400">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              T
            </span>
            TrackSuite
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">Track Your Order</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Enter your tracking number to see the latest delivery status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <IconSearch className="h-4 w-4" />
            </span>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TRK123456789"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : "Track"}
          </Button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {result && (
          <Card className="mt-6 animate-slide-up">
            <CardBody className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tracking Number</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{result.tracking_number}</p>
                </div>
                <Badge status={result.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Origin</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.origin || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Destination</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.destination || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Est. Delivery</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {result.estimated_delivery ? formatDate(result.estimated_delivery) : "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Tracking Timeline</p>
                <Timeline events={result.events} />
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
