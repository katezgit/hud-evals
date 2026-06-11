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

export function EnvRow({ env, isStarred, starCount }: EnvRowProps) {
  return (
    // `isolate` traps the row's internal stacking context — see EnvCard for
    // the full explanation. Without it the inner `relative z-10` nodes tie
    // with the page-level sticky chrome and bleed through on scroll.
    <article className="relative isolate rounded-lg border border-border bg-panel p-4 transition-colors duration-fast hover:border-border-strong hover:bg-hover">
      {/* Mobile layout — 3 rows, wireframe §13b. */}
      <div className="flex flex-col gap-1 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <EnvTypeIcon type={env.type} />
          <span className="min-w-0 flex-1 truncate font-mono text-body text-muted-foreground">
            {env.organization}
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
        <Link
          href={`/environments/${env.id}`}
          className="block min-w-0 truncate font-mono text-body font-semibold text-foreground outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:underline focus-visible:underline-offset-4"
        >
          {env.name}
        </Link>
        <div className="flex items-center justify-between gap-3 font-mono text-meta">
          <div className="flex items-center gap-3 text-meta-foreground">
            <BareMetric
              icon={<ClipboardList aria-hidden="true" className="size-3.5" />}
              count={env.scenarios.length}
              label="scenarios"
            />
            <BareMetric
              icon={<Wrench aria-hidden="true" className="size-3.5" />}
              count={env.tools.length}
              label="tools"
            />
          </div>
          <span
            aria-live="polite"
            className="tabular-nums text-muted-foreground"
          >
            {env.runsLast24h > 0
              ? `${env.runsLast24h} runs/24h`
              : "0 runs/24h"}
          </span>
        </div>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <EnvTypeIcon type={env.type} />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-baseline gap-1 font-mono text-body">
            <span className="truncate text-muted-foreground">
              {env.organization}
            </span>
            <span aria-hidden="true" className="text-muted-foreground">
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
          <div className="relative z-10 mt-0.5 max-w-2xl">
            <DescriptionWithLinks text={env.description} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 font-mono text-meta text-meta-foreground">
          <LabeledMetric
            icon={<ClipboardList aria-hidden="true" className="size-3.5" />}
            count={env.scenarios.length}
            label="scenarios"
          />
          <LabeledMetric
            icon={<Wrench aria-hidden="true" className="size-3.5" />}
            count={env.tools.length}
            label="tools"
          />
        </div>

        <span className="relative z-10 inline-flex">
          <StarCount
            count={starCount}
            pressed={isStarred}
            onPressedChange={noopStarToggle}
            label={env.name}
            size="sm"
          />
        </span>
      </div>
    </article>
  );
}

function noopStarToggle() {}

function BareMetric({
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
    </span>
  );
}

function LabeledMetric({
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
