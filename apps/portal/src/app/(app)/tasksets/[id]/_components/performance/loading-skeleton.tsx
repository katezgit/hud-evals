import { Skeleton } from "@repo/ui/components/skeleton";

export default function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-6"
    >
      <span className="sr-only">Analysis running.</span>
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
