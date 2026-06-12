import { LoaderIcon } from "lucide-react";

/**
 * Route-segment Suspense fallback for the (app) group.
 *
 * Preserves two non-obvious behaviors:
 * - 200ms anti-flash: spinner stays opacity:0 until 200ms have elapsed, so
 *   fast routes never visually show it.
 * - prefers-reduced-motion: `motion-safe:animate-spin` omits the rotation
 *   entirely when the user has reduced motion enabled (Tailwind's
 *   `animate-spin` does not respect the media query on its own).
 *
 * Spinner glyph matches `toast.promise(...)` loading state — see
 * packages/ui/src/components/toast.tsx.
 */
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
