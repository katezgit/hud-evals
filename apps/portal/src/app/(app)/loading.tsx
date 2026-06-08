// Suspense fallback for (app) route navigation. Server-streamed; covers the gap
// between click and first paint. In-component skeletons handle client-side
// refetches separately (see app-conventions.loading-and-errors.md).
export default function AppLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded-control bg-muted" />
      <div className="h-4 w-full animate-pulse rounded-control bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded-control bg-muted" />
    </div>
  );
}
