"use client";

import { ArrowRightIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/cn";
import type { Scenario } from "../_data/types";

/**
 * Overview tab scenario card — orient-and-validate role.
 *
 * Light surface: name, one-line description, "Load this scenario →" CTA. The
 * button is always enabled regardless of env-var state; the drawer handles
 * missing-vars inline. When this scenario's drawer is open, the card switches
 * to the "Loaded" state — darker border + "Loaded" CTA — and reverts the
 * moment the drawer is dismissed. No schema preview, kebab menu, or "Used by"
 * footer — those affordances are exclusive to the Scenarios tab.
 *
 * Sibling: ScenariosTabScenarioCard (full compose surface).
 */
export interface OverviewScenarioCardProps {
  scenario: Scenario;
  /** True when this scenario's drawer is currently open. */
  loaded: boolean;
  onLoad: (scenario: Scenario) => void;
}

export function OverviewScenarioCard({
  scenario,
  loaded,
  onLoad,
}: OverviewScenarioCardProps) {
  return (
    <article
      aria-current={loaded ? "true" : undefined}
      className={cn(
        "group/card flex h-full flex-col gap-3 rounded-lg border p-4",
        "transition-[box-shadow,background-color,border-color]",
        loaded
          ? "border-primary bg-primary-glow"
          : "border-border bg-panel hover:shadow-(--shadow-card)",
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h3
          className={cn(
            "font-mono text-body font-semibold",
            loaded ? "text-primary" : "text-foreground",
          )}
        >
          {scenario.name}
        </h3>
        <p className="text-label text-muted-foreground line-clamp-3">
          {scenario.description}
        </p>
      </div>

      <div className="mt-auto">
        <button
          type="button"
          onClick={() => onLoad(scenario)}
          aria-pressed={loaded}
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-lg border px-3.5 text-body font-medium",
            "transition-colors duration-fast",
            "focus-visible:shadow-focus-ring outline-hidden",
            "[&_svg]:size-4",
            loaded
              ? "cursor-default border-primary bg-primary-glow text-primary"
              : "cursor-pointer border-border bg-transparent text-foreground group-hover/card:border-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground",
          )}
        >
          {loaded ? "Loaded" : "Load this scenario"}
          {!loaded && <ArrowRightIcon aria-hidden="true" />}
        </button>
      </div>
    </article>
  );
}
