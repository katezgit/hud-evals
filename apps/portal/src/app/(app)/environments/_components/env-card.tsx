import Link from "next/link";
import { ClipboardList, Wrench } from "lucide-react";
import { StarCount } from "@repo/ui/components/star-count";
import { cn } from "@repo/ui/lib/cn";
import type { Environment } from "../[id]/_data/types";
import { DescriptionWithLinks } from "./description-with-links";
import { EnvTypeIcon } from "./env-type-icon";

interface EnvCardProps {
  env: Environment;
  isStarred: boolean;
  starCount: number;
}

/**
 * Index card for an Environment.
 *
 * Layout (top → bottom):
 *  - Top row: `[type icon] {org}/{name}                 ☆ count`
 *    The `{org}/{name}` row uses `gap-1` (4px) — a tighter single thin space
 *    on each side of `/` than `gap-2` which read visually loose against the
 *    mockup. `/` stays as a separate aria-hidden span so org and name keep
 *    independent truncation.
 *  - Runs subtitle (muted, aria-live): `{N} runs/24 hours`.
 *  - Description with linkified URLs (URL click stays a sub-action).
 *  - Footer bi-metric: `📋 N scenarios · 🔧 N tools` (env vars dropped).
 *
 * Click model — overlay-link pattern. The env-name `<Link>` carries an
 * `::after` absolute overlay (`after:absolute after:inset-0`) sized to the
 * `relative` article root, making the entire card surface navigable to
 * `/environments/[id]` without nesting a `<button>` inside an `<a>`
 * (invalid HTML). The star button and the description URL link sit at
 * `relative z-10` so they paint above the overlay and receive clicks
 * directly — no `stopPropagation` hack needed.
 *
 * The star is non-interactive for now per brief: clicks must not navigate,
 * but the toggle behavior is deferred to a later pass. `onPressedChange` is
 * a no-op so the visual state stays consistent.
 */
export function EnvCard({ env, isStarred, starCount }: EnvCardProps) {
  return (
    // `isolate` traps the card's internal stacking context. The overlay-link
    // pattern uses `relative z-10` on the star button + description URL so
    // they paint above the `::after` overlay (z-0 of the card). Without
    // `isolate`, those z-10 nodes escape into the page-level stacking context
    // and tie with the sticky page chrome (also z-10), letting card content
    // visibly bleed through the pinned header on scroll.
    <article className="group relative isolate flex h-full flex-col gap-3 rounded-lg border border-border bg-panel p-4 transition-colors duration-fast hover:border-border-strong hover:bg-hover-surface focus-within:border-border-strong">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <EnvTypeIcon type={env.type} />
          <span className="flex min-w-0 flex-1 items-baseline gap-1 font-mono text-body">
            <span className="truncate text-muted-foreground">
              {env.organization}
            </span>
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
            <Link
              href={`/environments/${env.id}`}
              className="truncate font-semibold text-foreground outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:underline focus-visible:underline-offset-4"
            >
              {env.name}
            </Link>
          </span>
          <span className="relative z-10">
            <StarCount
              count={starCount}
              pressed={isStarred}
              onPressedChange={noopStarToggle}
              label={env.name}
              size="sm"
            />
          </span>
        </div>
        <RunsSubtitle runs={env.runsLast24h} />
      </div>

      <div className="relative z-10 flex-1">
        <DescriptionWithLinks text={env.description} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 font-mono text-meta text-meta-foreground">
        <Metric
          icon={<ClipboardList aria-hidden="true" className="size-3.5" />}
          count={env.scenarios.length}
          label="scenarios"
        />
        <Metric
          icon={<Wrench aria-hidden="true" className="size-3.5" />}
          count={env.tools.length}
          label="tools"
        />
      </div>
    </article>
  );
}

// Deferred: real star toggle. Today the star is a no-op so clicks don't
// hijack card navigation. The StarCount primitive already calls
// stopPropagation on click; the overlay-link pattern means the click never
// reaches the card link anyway.
function noopStarToggle() {}

function RunsSubtitle({ runs }: { runs: number }) {
  if (runs === 0) {
    return (
      <p
        aria-live="polite"
        className="ml-8 font-mono text-caption tabular-nums text-muted-foreground"
      >
        No runs/24 hours
      </p>
    );
  }
  return (
    <p
      aria-live="polite"
      className="ml-8 font-mono text-caption tabular-nums text-muted-foreground"
    >
      <span className="font-semibold text-foreground">{runs}</span>{" "}
      runs/24 hours
    </p>
  );
}

function Metric({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  const isZero = count === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        isZero && "opacity-mid",
      )}
    >
      {icon}
      <span>{count}</span>
      <span>{label}</span>
    </span>
  );
}
