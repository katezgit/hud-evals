// RSC-safe Suspense fallback. SVG ring + CSS keyframes only — no JS, no state.
// 200ms anti-flash via opacity gating; rotation suppressed under prefers-reduced-motion
// because --motion-continuous collapses to `none` in theme.css.
// Co-located keyframes (`spinner-rotate`, `spinner-appear`) are implementation detail
// of this one route file — not a design-system primitive (per loading/spec.md §6).
export default function AppLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex h-full w-full items-center justify-center"
    >
      <style>{`
        @keyframes spinner-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinner-appear {
          to { opacity: 1; }
        }
        .spinner-wrap {
          opacity: 0;
          animation:
            spinner-appear 0ms var(--ease-out-standard) 200ms forwards,
            spinner-rotate var(--motion-continuous) 200ms;
        }
      `}</style>
      <span className="spinner-wrap inline-flex size-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-5"
          fill="none"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="var(--color-border)"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="var(--color-muted-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="12.566 50.265"
          />
        </svg>
      </span>
    </div>
  );
}
