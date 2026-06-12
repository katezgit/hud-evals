import { LoaderIcon } from "lucide-react";

// 200ms opacity gate suppresses flash on sub-200ms loads.
// motion-safe: needed because Tailwind's animate-spin ignores prefers-reduced-motion.
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-full w-full items-center justify-center py-12"
    >
      <style>{`
        @keyframes spinner-appear {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        [data-slot="route-spinner"] {
          opacity: 0;
          animation: spinner-appear 120ms var(--ease-out-standard) 200ms forwards;
        }
      `}</style>
      <p
        data-slot="route-spinner"
        className="inline-flex items-center gap-2 text-muted-foreground"
      >
        <LoaderIcon
          className="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <span>loading</span>
      </p>
    </div>
  );
}
