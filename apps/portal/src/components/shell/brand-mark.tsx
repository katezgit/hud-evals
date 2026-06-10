/**
 * Sidebar brand mark — identity anchor only, NOT a home button (per
 * docs/design/components/app-shell/spec.md §3a). Notched-viewport SVG mark +
 * gold dot lockup; collapsed sidebar shows just the mark + dot (no wordmark).
 * Gold is the only chromatic occurrence in the lockup — never on the mark.
 */
import { cn } from "@repo/ui/lib/cn";

interface BrandMarkProps {
  collapsed?: boolean;
}

export function BrandMark({ collapsed = false }: BrandMarkProps) {
  return (
    <div
      aria-label="HUD"
      className={cn(
        "flex h-11 shrink-0 items-center",
        collapsed ? "justify-center px-2" : "gap-2 px-3",
      )}
    >
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("text-foreground", collapsed ? "size-4" : "size-5")}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 0H0V16H16V4H12V0ZM13 4H3V13H13V4Z"
          />
        </svg>
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 size-1 rounded-full bg-brand"
        />
      </div>
      {!collapsed ? (
        <span className="font-mono text-label font-medium tracking-widest text-muted-foreground">
          HUD
        </span>
      ) : null}
    </div>
  );
}
