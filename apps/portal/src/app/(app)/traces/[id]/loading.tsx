import type { HTMLAttributes } from "react";
import { cn } from "@repo/ui/lib/cn";

// Skeleton mirrors TraceDetailView's outer envelope (page-shell h-full min-h-0)
// and the Replay-tab two-column workspace so the page doesn't reflow when data
// lands. Neutral placeholders only — no status color before data exists.
function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-muted-surface", className)}
      {...rest}
    />
  );
}

export default function TraceDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Loading trace"
      className="page-shell h-full min-h-0"
    >
      <header className="flex flex-col gap-3 pt-2">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="h-8 w-3/5 rounded-md" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-40 rounded-sm" />
              <span aria-hidden="true" className="text-meta-foreground">·</span>
              <Skeleton className="h-3 w-24 rounded-sm" />
              <span aria-hidden="true" className="text-meta-foreground">·</span>
              <Skeleton className="h-3 w-20 rounded-sm" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-6 w-28 rounded-md" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 items-center gap-6 border-b border-border">
          <Skeleton className="h-6 w-14 rounded-sm" />
          <Skeleton className="h-6 w-12 rounded-sm" />
          <Skeleton className="h-6 w-14 rounded-sm" />
        </div>

        <div className="flex shrink-0 items-center gap-4 rounded-md border border-border bg-muted-surface px-3 py-3">
          <div className="flex-1 px-2">
            <div className="relative h-7 w-full">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border-strong"
              />
              {[6, 18, 30, 42, 54, 68, 82, 94].map((pct) => (
                <Skeleton
                  key={pct}
                  className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${pct}%` }}
                />
              ))}
            </div>
          </div>
          <Skeleton className="hidden h-3 w-28 rounded-sm md:block" />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section className="flex min-h-0 min-w-0 flex-col rounded-md border border-border bg-panel">
            <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2">
              <Skeleton className="h-4 w-48 rounded-sm" />
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <Skeleton className="aspect-video w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-sm" />
            </div>
          </section>

          <section className="flex min-h-0 min-w-0 flex-col rounded-md border border-border bg-panel">
            <header className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-2">
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm" />
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20 rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-5/6 rounded-sm" />
              </div>

              {["tool call", "arguments", "observation"].map((label) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 rounded-md bg-muted-surface px-3 py-2"
                >
                  <Skeleton className="h-3 w-24 rounded-sm bg-border" />
                  <Skeleton className="h-3 w-full rounded-sm bg-border" />
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-1.5">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
              </div>
            </div>
          </section>
        </div>
      </div>

      <span className="sr-only">Loading trace</span>
    </div>
  );
}
