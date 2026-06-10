import Link from "next/link";
import { ClipboardList, Wrench } from "lucide-react";
import { StarCount } from "@repo/ui/components/star-count";
import { cn } from "@repo/ui/lib/cn";
import type { Environment } from "../[id]/_data/types";
import { DescriptionWithLinks } from "./description-with-links";
import { EnvTypeIcon } from "./env-type-icon";

interface EnvRowProps {
  env: Environment;
  isStarred: boolean;
  starCount: number;
}

/**
 * Single-row List-view representation of an Environment.
 *
 * Minimal first pass per brief — single-column denser row, same data shape as
 * the grid card. Pixel-final three-column meta layout (spec §5) is deferred
 * to a follow-up. Uses the same overlay-link pattern as `EnvCard` so star +
 * URL link sit above the navigation overlay.
 */
export function EnvRow({ env, isStarred, starCount }: EnvRowProps) {
  return (
    // `isolate` traps the row's internal stacking context — see EnvCard for
    // the full explanation. Without it the inner `relative z-10` nodes tie
    // with the page-level sticky chrome and bleed through on scroll.
    //
    // Mobile (<md): items-start so the type icon aligns with the org prefix
    // line (row 1 of the stacked identity). Tablet+ flips to items-center
    // alongside the single-line `org / name`.
    <article className="relative isolate flex items-start gap-3 rounded-lg border border-border bg-panel p-4 transition-colors duration-fast hover:border-border-strong hover:bg-hover md:items-center md:gap-4">
      <EnvTypeIcon type={env.type} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Mobile identity: two-line stack (org row + name+star row).
            Tablet+ collapses to one line `org / name … star` as before.
            Spec §13 mobile decision 5: no `/` separator at mobile. */}
        <div className="flex min-w-0 flex-col gap-0.5 font-mono text-body md:flex-row md:items-baseline md:gap-1">
          <span className="flex min-w-0 items-baseline gap-2 md:contents">
            <span className="min-w-0 flex-1 truncate text-muted-foreground md:flex-none">
              {env.organization}
            </span>
            {/* Star inline with the org row on mobile so the name row stays
                clean; on tablet+ the star sits at the row's trailing end
                (rendered separately below to keep the truncating name in
                the same flex line). */}
            <span className="relative z-10 md:hidden">
              <StarCount
                count={starCount}
                pressed={isStarred}
                onPressedChange={noopStarToggle}
                label={env.name}
                size="sm"
              />
            </span>
          </span>
          <span
            aria-hidden="true"
            className="hidden text-muted-foreground md:inline"
          >
            /
          </span>
          <Link
            href={`/environments/${env.id}`}
            className="min-w-0 truncate font-semibold text-foreground outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:underline focus-visible:underline-offset-4"
          >
            {env.name}
          </Link>
        </div>
        <p
          aria-live="polite"
          className="font-mono text-meta tabular-nums text-muted-foreground"
        >
          {env.runsLast24h > 0
            ? `${env.runsLast24h} runs/24 hours`
            : "0 runs/24 hours"}
        </p>
        {/* Description hidden at mobile per spec §13 — recoverable from the
            detail page. Tablet+ keeps the truncated description inline. */}
        <div className="relative z-10 mt-0.5 hidden max-w-2xl md:block">
          <DescriptionWithLinks text={env.description} />
        </div>
      </div>

      {/* Bi-metric strip.
          Mobile (<md): icon + count only, no labels, label on aria-label.
          Tablet+: icon + count + visible label as today. */}
      <div className="flex shrink-0 items-center gap-3 font-mono text-meta text-meta-foreground">
        <RowMetric
          icon={<ClipboardList aria-hidden="true" className="size-3.5" />}
          count={env.scenarios.length}
          label="scenarios"
        />
        <RowMetric
          icon={<Wrench aria-hidden="true" className="size-3.5" />}
          count={env.tools.length}
          label="tools"
        />
      </div>

      {/* Star at row trailing end — tablet+ only. Mobile renders the star
          inline with the org row above. */}
      <span className="relative z-10 hidden md:inline-flex">
        <StarCount
          count={starCount}
          pressed={isStarred}
          onPressedChange={noopStarToggle}
          label={env.name}
          size="sm"
        />
      </span>
    </article>
  );
}

function noopStarToggle() {}

function RowMetric({
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
      aria-label={`${count} ${label}`}
    >
      {icon}
      <span aria-hidden="true">{count}</span>
      <span aria-hidden="true" className="hidden md:inline">
        {label}
      </span>
    </span>
  );
}
