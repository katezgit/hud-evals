import { Skeleton } from "@repo/ui/components/skeleton";

// Suspense fallback for (app) route navigation. Server-streamed; covers the gap
// between click and first paint. In-component skeletons handle client-side
// refetches separately (see app-conventions.loading-and-errors.md).
export default function AppLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
